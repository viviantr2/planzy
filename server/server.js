require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const mongoose   = require("mongoose");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const { OpenAI } = require("openai");

const app    = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SECRET = process.env.JWT_SECRET || "planzy_secret";

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// ── User Model ──
const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

// ── Task Model ──
const TaskSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:      { type: String,  required: true },
  deadline:  { type: String,  required: true },
  priority:  { type: Number,  default: 1     },
  studyTime: { type: Number,  default: 0     },
  completed: { type: Boolean, default: false },
  weight:    { type: Number,  default: 0     },
  notes:     { type: String,  default: ""    },
});

const Task = mongoose.model("Task", TaskSchema);

// ── Auth Middleware ──
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ══════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════

app.get("/", (req, res) => res.send("Planzy server is running"));

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Email not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
// TASK ROUTES (protected)
// ══════════════════════════════════════

app.post("/api/tasks", auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.userId });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tasks/:id", auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
// AI: ESTIMATE HOURS (protected)
// ══════════════════════════════════════

app.post("/api/estimate-hours", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "No description" });

    const prompt = [
      "You are a university study advisor.",
      "A second-year university student needs to complete this assignment.",
      "Estimate how many hours they would realistically need.",
      "",
      "Assignment description:",
      description,
      "",
      "Consider: understanding the brief, research, drafting, writing/coding, review, submission.",
      "Assume a competent but not expert student at a normal pace.",
      "",
      'Respond ONLY with valid JSON (no markdown): { "hours": <number with 1 decimal>, "reasoning": "<1-2 sentences>" }',
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const raw   = completion.choices[0].message.content.trim();
    const clean = raw.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error("Estimate error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════
// AI: GENERATE SCHEDULE (protected)
// ══════════════════════════════════════

app.post("/api/schedule/generate", auth, async (req, res) => {
  try {
    const { tasks, routine } = req.body;
    if (!tasks || tasks.length === 0)
      return res.status(400).json({ error: "No tasks provided" });

    const today    = new Date();
    const todayStr = today.toLocaleDateString("en-AU", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const taskLines = tasks.map(function(t) {
      const daysLeft   = Math.ceil((new Date(t.deadline) - today) / 86400000);
      const weightStr  = t.weight > 0 ? ", worth " + t.weight + "% of grade" : "";
      let taskLine     = '- "' + t.name + '": deadline in ' + daysLeft + ' day(s), needs ' + t.studyTime + 'h study, priority ' + t.priority + '/3' + weightStr;
      if (t.notes && t.notes.trim()) taskLine += "\n  Context: " + t.notes.trim();
      return taskLine;
    }).join("\n");

    const lines = [""];
    lines.push("=== STRICT DAILY TIME BOUNDARIES — MUST FOLLOW EXACTLY ===");
    lines.push("The schedule MUST start at wake time and MUST end at sleep time for each day.");
    lines.push("");

    if (routine && routine.days) {
      routine.days.forEach(function(d) {
        lines.push(d.day.toUpperCase() + ": wake=" + d.wakeUp + "  sleep=" + d.sleep + "  →  schedule ONLY between " + d.wakeUp + " and " + d.sleep);
      });

      lines.push("");
      lines.push("=== FIXED EVENTS — include exactly, no study during these ===");
      var hasFixed = false;
      routine.days.forEach(function(d) {
        var evs = (routine.events || []).filter(function(ev) {
          return ev.days && ev.days.includes(d.day);
        });
        if (evs.length > 0) {
          hasFixed = true;
          lines.push(d.day + ": " + evs.map(function(ev) {
            return ev.name + " " + ev.startTime + "-" + ev.endTime + " (" + ev.type + ")";
          }).join(" | "));
        }
      });
      if (!hasFixed) lines.push("(none)");
    }

    const routineSection = lines.join("\n");

    const promptParts = [
      "You are a smart student productivity planner. Today is " + todayStr + ".",
      "",
      "TASKS TO SCHEDULE:",
      taskLines,
      routineSection,
      "",
      "=== RULES ===",
      "1. WAKE/SLEEP: First block of each day starts at EXACTLY wake time. Last block ends at EXACTLY sleep time. Mandatory.",
      "2. FIXED EVENTS: Include them exactly as listed. Never schedule study/personal during them.",
      "3. MEALS: If no fixed meal for a day, add breakfast (30min after wake), lunch (1h midday), dinner (45min early evening).",
      "4. BREAKS: 15-30 min break after every 1.5-2h of study.",
      "5. PERSONAL TIME: At least 1h personal/leisure per day.",
      "6. PRIORITY: Tasks closer to deadline and with higher weight get more study blocks earlier in the week.",
      "7. BALANCE: Spread study evenly, don't overload one day.",
      "8. SPECIFIC ACTIVITIES: Never write just the subject name. Always specify what to do: e.g. \"SOFT3202 — lecture 4 + tutorial\", \"BUSS1030 — practice questions ch.3\", \"PTE — Repeat Sentence 30 items + Read Aloud\". Use Context notes to choose the right activity.",
      "",
      "Return ONLY valid JSON — no markdown:",
      "{",
      "  \"week\": [",
      "    {",
      "      \"day\": \"Monday\",",
      "      \"note\": \"Short tip\",",
      "      \"blocks\": [",
      "        { \"startTime\": \"08:00\", \"endTime\": \"08:30\", \"duration\": \"30 min\", \"type\": \"meal\", \"task\": \"Breakfast\", \"note\": \"\" }",
      "      ]",
      "    }",
      "  ]",
      "}",
      "",
      "FINAL CHECK: For every day, first block startTime = wake time, last block endTime = sleep time.",
      "Types: study | break | meal | personal | sleep | class | work | exercise | commute",
      "Generate all 7 days.",
    ];

    const dayBoundaries = (routine && routine.days)
      ? routine.days.map(function(d) { return d.day + ": start=" + d.wakeUp + ", end=" + d.sleep; }).join(" | ")
      : "all days: start=07:00, end=23:00";

    const systemMsg = "You are a schedule planner that strictly follows time boundaries. "
      + "Daily boundaries: " + dayBoundaries + ". "
      + "The first block of each day MUST start at that day's start time. "
      + "The last block MUST end at that day's end time. Never violate this.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: promptParts.join("\n") },
      ],
      temperature: 0.5,
      max_tokens: 6000,
    });

    const raw   = completion.choices[0].message.content.trim();
    const clean = raw.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim();
    res.json(JSON.parse(clean));
  } catch (err) {
    console.error("Schedule error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5050;
app.listen(PORT, () => console.log("Server running on port " + PORT));