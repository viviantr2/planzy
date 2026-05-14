import { useState, useEffect } from "react";

/* ─────────────────────────────────────────
   INLINE SVG ICONS
───────────────────────────────────────── */
const PATHS = {
  Home:          ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
  ListChecks:    ["M9 11l3 3L22 4","M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"],
  Calendar:      ["M8 2v4","M16 2v4","M3 10h18","M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  BrainCircuit:  ["M12 5a3 3 0 1 0-5.996.2 4 4 0 0 0-3.8 3.8 3 3 0 0 0 .96 5.98A3 3 0 0 0 12 19a3 3 0 0 0 7.84-4.02 3 3 0 0 0 .96-5.98 4 4 0 0 0-3.8-3.8A3 3 0 0 0 12 5","M6 20v-2","M6 14v-4","M18 20v-2","M18 14v-4","M12 20v-6","M12 10V8"],
  Plus:          ["M12 5v14","M5 12h14"],
  Check:         ["M20 6L9 17l-5-5"],
  Trash2:        ["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"],
  Clock:         ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 6v6l4 2"],
  AlertTriangle: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  X:             ["M18 6L6 18","M6 6l12 12"],
  Edit2:         ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  Settings:      ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
};

function Ico({ name, size=18, color="currentColor", strokeWidth=1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display:"inline-block", flexShrink:0 }}>
      {(PATHS[name]||[]).map((d,i)=><path key={i} d={d}/>)}
    </svg>
  );
}

/* ─────────────────────────────────────────
   COLOUR TOKENS
───────────────────────────────────────── */
const C = {
  purple:"#5B4CF5", purpleSoft:"#EEF0FF", purpleMid:"#C4BDFB",
  blue:"#2563EB", blueSoft:"#EFF6FF",
  green:"#059669", greenSoft:"#ECFDF5",
  amber:"#D97706", amberSoft:"#FFFBEB",
  red:"#DC2626", redSoft:"#FEF2F2",
  cyan:"#0891B2", cyanSoft:"#ECFEFF",
  violet:"#7C3AED", violetSoft:"#F5F3FF",
  bg:"#F4F4F9", white:"#FFFFFF",
  g50:"#F9FAFB", g100:"#F3F4F6", g200:"#E5E7EB",
  g300:"#D1D5DB", g400:"#9CA3AF", g500:"#6B7280",
  g700:"#374151", g800:"#1F2937", g900:"#111827",
};

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const WEEK_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const BASE = process.env.REACT_APP_API_URL || "http://localhost:5050";
const API = BASE + "/api/tasks";

const DEFAULT_ROUTINE = {
  days: WEEK_DAYS.map((day,i) => ({ day, wakeUp: i<5?"07:00":"08:00", sleep: i<5?"23:00":"23:30" })),
  events: [],
};

const EVENT_TYPES = {
  class:    { label:"Class",    color:C.blue,   bg:C.blueSoft   },
  work:     { label:"Work",     color:C.amber,  bg:C.amberSoft  },
  meal:     { label:"Meal",     color:C.cyan,   bg:C.cyanSoft   },
  exercise: { label:"Exercise", color:C.green,  bg:C.greenSoft  },
  personal: { label:"Personal", color:C.g500,   bg:C.g100       },
  commute:  { label:"Commute",  color:C.violet, bg:C.violetSoft },
};

const NAV = [
  { id:"dashboard", label:"Dashboard",  icon:"Home"         },
  { id:"tasks",     label:"My Tasks",   icon:"ListChecks"   },
  { id:"calendar",  label:"Calendar",   icon:"Calendar"     },
  { id:"schedule",  label:"AI Schedule",icon:"BrainCircuit" },
  { id:"routine",   label:"My Routine", icon:"Settings"     },
];

const BLOCK_STYLES = {
  study:    { color:C.purple, bg:C.purpleSoft, border:C.purpleMid },
  break:    { color:C.green,  bg:C.greenSoft,  border:"#6EE7B7"   },
  meal:     { color:C.cyan,   bg:C.cyanSoft,   border:"#67E8F9"   },
  personal: { color:C.g500,   bg:C.g100,       border:C.g300      },
  sleep:    { color:C.g400,   bg:C.g50,        border:C.g200      },
  class:    { color:C.blue,   bg:C.blueSoft,   border:"#93C5FD"   },
  work:     { color:C.amber,  bg:C.amberSoft,  border:"#FCD34D"   },
  exercise: { color:C.green,  bg:C.greenSoft,  border:"#6EE7B7"   },
  commute:  { color:C.violet, bg:C.violetSoft, border:"#C4B5FD"   },
};

/* ─────────────────────────────────────────
   AI LOGIC
───────────────────────────────────────── */
function getUrgency(task) {
  const days = Math.ceil((new Date(task.deadline)-new Date())/86400000);
  if (days<0)  return { tag:"Overdue",  days, color:C.red,   bg:C.redSoft   };
  if (days<=2) return { tag:"Critical", days, color:C.red,   bg:C.redSoft   };
  if (days<=5) return { tag:"Soon",     days, color:C.amber, bg:C.amberSoft };
  return         { tag:"On track", days, color:C.green, bg:C.greenSoft };
}

function getDailyHours(task) {
  const days = Math.ceil((new Date(task.deadline)-new Date())/86400000);
  if (!task.studyTime||days<=0) return null;
  return (task.studyTime/days).toFixed(1);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-AU",{day:"numeric",month:"short"});
}

/* ─────────────────────────────────────────
   STYLE HELPERS
───────────────────────────────────────── */
const inpStyle = (extra={}) => ({
  width:"100%", padding:"9px 12px", borderRadius:8, fontSize:14,
  border:`1.5px solid ${C.g200}`, outline:"none", color:C.g800,
  fontFamily:"inherit", background:C.white, boxSizing:"border-box", ...extra,
});
const lblStyle = { fontSize:13, fontWeight:500, color:C.g600, marginBottom:4, display:"block" };

/* ─────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────── */
function Sidebar({ active, onChange, user, onLogout }) {
  return (
    <aside style={{
      width:232, minHeight:"100vh", flexShrink:0,
      background:C.white, borderRight:`1px solid ${C.g200}`,
      display:"flex", flexDirection:"column", padding:"0 0 20px",
    }}>
      <div style={{ padding:"28px 20px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:C.purple,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ico name="BrainCircuit" size={20} color="white"/>
          </div>
          <span style={{ fontSize:20, fontWeight:700, color:C.g900, letterSpacing:"-0.4px" }}>Planzy</span>
        </div>
        <p style={{ fontSize:11.5, color:C.g400, marginTop:5, paddingLeft:46 }}>AI Study Planner</p>
      </div>
      <nav style={{ flex:1, padding:"0 10px" }}>
        {NAV.map(({id,label,icon})=>{
          const on = active===id;
          return (
            <button key={id} onClick={()=>onChange(id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10,
              padding:"10px 12px", borderRadius:10, border:"none",
              background: on?C.purpleSoft:"transparent",
              color: on?C.purple:C.g500,
              fontWeight: on?600:400, fontSize:14, cursor:"pointer",
              marginBottom:2, fontFamily:"inherit",
            }}>
              <Ico name={icon} size={17} color={on?C.purple:C.g400} strokeWidth={on?2.2:1.8}/>
              {label}
            </button>
          );
        })}
      </nav>
      <div style={{
        margin:"0 10px", padding:"12px 14px", borderRadius:12,
        background:C.g50, border:`1px solid ${C.g200}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <div style={{
            width:34, height:34, borderRadius:"50%", background:C.purpleMid,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, color:C.purple, flexShrink:0,
          }}>{user?user.name.charAt(0).toUpperCase():"?"}</div>
          <div style={{ overflow:"hidden" }}>
            <p style={{ fontSize:13, fontWeight:600, color:C.g800, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?user.name:"Guest"}
            </p>
            <p style={{ fontSize:11, color:C.g400, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user?user.email:""}
            </p>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width:"100%", padding:"7px 0", borderRadius:8,
          border:`1px solid ${C.g200}`, background:C.white,
          color:C.g500, fontSize:12, fontWeight:500,
          cursor:"pointer", fontFamily:"inherit",
        }}>Sign out</button>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ label, value, icon, color, bg }) {
  return (
    <div style={{
      background:C.white, borderRadius:14, padding:"20px 22px",
      border:`1px solid ${C.g200}`, display:"flex", flexDirection:"column", gap:14,
    }}>
      <div style={{ width:40, height:40, borderRadius:10, background:bg,
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Ico name={icon} size={19} color={color} strokeWidth={2}/>
      </div>
      <div>
        <p style={{ fontSize:30, fontWeight:700, color:C.g900, lineHeight:1, margin:0 }}>{value}</p>
        <p style={{ fontSize:13, color:C.g400, margin:"5px 0 0" }}>{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CHIP
───────────────────────────────────────── */
function Chip({ icon, text, color, bg, bold }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      fontSize:12, fontWeight:bold?600:400,
      color, background:bg, padding:"3px 9px", borderRadius:20,
    }}>
      {icon&&<Ico name={icon} size={12} color={color}/>}{text}
    </span>
  );
}

/* ─────────────────────────────────────────
   TASK CARD
───────────────────────────────────────── */
function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name:task.name, deadline:task.deadline||"", studyTime:task.studyTime||"", priority:task.priority||1, weight:task.weight||"", notes:task.notes||"" });
  const u = getUrgency(task);
  const daily = getDailyHours(task);

  if (editing) {
    return (
      <div style={{ background:C.white, borderRadius:12, border:`1.5px solid ${C.purpleMid}`, padding:"14px 18px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
          <div style={{ gridColumn:"1 / -1" }}>
            <label style={lblStyle}>Task name</label>
            <input style={inpStyle()} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div>
            <label style={lblStyle}>Deadline</label>
            <input type="date" style={inpStyle({cursor:"pointer"})} value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} onClick={e=>{ try{e.target.showPicker();}catch(err){} }}/>
          </div>
          <div>
            <label style={lblStyle}>Study hours</label>
            <input type="number" style={inpStyle()} min="0.5" step="0.5" value={form.studyTime} onChange={e=>setForm(f=>({...f,studyTime:e.target.value}))}/>
          </div>
          <div>
            <label style={lblStyle}>Priority</label>
            <select style={inpStyle()} value={form.priority} onChange={e=>setForm(f=>({...f,priority:+e.target.value}))}>
              <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
            </select>
          </div>
          <div>
            <label style={lblStyle}>Weight %</label>
            <input type="number" style={inpStyle()} placeholder="e.g. 30" min="0" max="100"
              value={form.weight||""} onChange={e=>setForm(f=>({...f,weight:e.target.value}))}/>
          </div>
          <div style={{ gridColumn:"1 / -1" }}>
            <label style={lblStyle}>Context for AI</label>
            <textarea style={{ ...inpStyle(), height:60, resize:"vertical", fontSize:13 }}
              placeholder="What should AI know about this task?"
              value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>{ onEdit(task._id, form); setEditing(false); }} style={{
            padding:"8px 18px", borderRadius:8, border:"none", background:C.purple,
            color:"white", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
          }}>Save</button>
          <button onClick={()=>{ setForm({name:task.name,deadline:task.deadline||"",studyTime:task.studyTime||"",priority:task.priority||1,weight:task.weight||"",notes:task.notes||""}); setEditing(false); }} style={{
            padding:"8px 14px", borderRadius:8, border:`1.5px solid ${C.g200}`,
            background:"transparent", color:C.g500, fontSize:13, cursor:"pointer", fontFamily:"inherit",
          }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background:C.white, borderRadius:12, border:`1px solid ${C.g200}`,
      borderLeft:`4px solid ${task.completed?C.g300:u.color}`,
      padding:"14px 18px", display:"flex", gap:14,
      alignItems:"flex-start", opacity:task.completed?0.55:1,
    }}>
      <button onClick={()=>onToggle(task)} style={{
        width:22, height:22, borderRadius:6, flexShrink:0, marginTop:1,
        border:`2px solid ${task.completed?C.purple:C.g300}`,
        background:task.completed?C.purple:"transparent",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {task.completed&&<Ico name="Check" size={12} color="white" strokeWidth={3}/>}
      </button>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:15, fontWeight:600, color:C.g800, margin:"0 0 7px",
          textDecoration:task.completed?"line-through":"none" }}>{task.name}</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
          {task.deadline&&<Chip icon="Calendar" text={fmtDate(task.deadline)} color={C.g400} bg={C.g100}/>}
          {task.studyTime>0&&<Chip icon="Clock" text={`${task.studyTime}h total`} color={C.g400} bg={C.g100}/>}
          {task.weight>0&&<Chip text={`${task.weight}% weight`} color={C.violet} bg={C.violetSoft} bold/>}
          {daily&&!task.completed&&<Chip text={`${daily}h/day`} color={C.purple} bg={C.purpleSoft} bold/>}
          {!task.completed&&task.deadline&&<Chip text={u.tag} color={u.color} bg={u.bg} bold/>}
          {task.completed&&<Chip text="Done" color={C.green} bg={C.greenSoft} bold/>}
        </div>
        {!task.completed&&task.deadline&&(
          <p style={{ fontSize:12, color:u.color, margin:"6px 0 0" }}>
            {u.days<0?`${Math.abs(u.days)} days overdue`:u.days===0?"Due today!":`${u.days} day${u.days!==1?"s":""} left`}
          </p>
        )}
        {task.notes&&(
          <p style={{ fontSize:12, color:C.g400, margin:"5px 0 0", fontStyle:"italic" }}>
            {task.notes.length>80?task.notes.slice(0,80)+"…":task.notes}
          </p>
        )}
      </div>
      <div style={{ display:"flex", gap:4, flexShrink:0 }}>
        <button onClick={()=>setEditing(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex" }}>
          <Ico name="Edit2" size={15} color={C.g300}/>
        </button>
        <button onClick={()=>onDelete(task._id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex" }}>
          <Ico name="Trash2" size={15} color={C.g300}/>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ADD TASK FORM
───────────────────────────────────────── */
function AddTaskForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ name:"", deadline:"", studyTime:"", priority:1, weight:"", notes:"" });
  const [showEst, setShowEst] = useState(false);
  const [desc, setDesc] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [estimation, setEstimation] = useState(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const estimateHours = async () => {
    if (!desc.trim()) return;
    setEstimating(true); setEstimation(null);
    try {
      const res = await fetch(BASE + "/api/estimate-hours", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ description: desc }),
      });
      const data = await res.json();
      setEstimation(data);
      set("studyTime", data.hours);
    } catch { setEstimation({ hours: null, reasoning: "Could not connect to server." }); }
    setEstimating(false);
  };

  return (
    <div style={{ background:C.white, borderRadius:14, border:`1.5px solid ${C.purpleMid}`, padding:"22px 24px", marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:C.g900, margin:0 }}>New Task</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", display:"flex" }}>
          <Ico name="X" size={17} color={C.g400}/>
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12 }}>
        <div style={{ gridColumn:"1 / -1" }}>
          <label style={lblStyle}>Task name *</label>
          <input style={inpStyle()} placeholder="e.g. COMP2123 Assignment 2" value={form.name} onChange={e=>set("name",e.target.value)}/>
        </div>
        <div>
          <label style={lblStyle}>Deadline</label>
          <input type="date" style={inpStyle({cursor:"pointer"})} value={form.deadline} onChange={e=>set("deadline",e.target.value)} onClick={e=>{ try{e.target.showPicker();}catch(err){} }}/>
        </div>
        <div>
          <label style={lblStyle}>Study hours</label>
          <input type="number" style={inpStyle()} placeholder="e.g. 6" min="0.5" step="0.5" value={form.studyTime} onChange={e=>set("studyTime",e.target.value)}/>
        </div>
        <div>
          <label style={lblStyle}>Weight % (if any)</label>
          <input type="number" style={inpStyle()} placeholder="e.g. 30" min="0" max="100" value={form.weight} onChange={e=>set("weight",e.target.value)}/>
        </div>
        <div>
          <label style={lblStyle}>Priority</label>
          <select style={inpStyle()} value={form.priority} onChange={e=>set("priority",+e.target.value)}>
            <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
          </select>
        </div>
      </div>

      {/* Notes field */}
      <div style={{ marginTop:12 }}>
        <label style={lblStyle}>Context for AI <span style={{ fontWeight:400, color:C.g400 }}>(optional but recommended)</span></label>
        <textarea
          style={{ ...inpStyle(), height:72, resize:"vertical", fontSize:13 }}
          placeholder={"e.g. Only 3/10 weeks done, exam 20/6. Focus on: catching up lectures, tutorial labs, coding practice\ne.g. PTE aim all bands 72, practise RS + RA daily, mock test weekly"}
          value={form.notes}
          onChange={e=>set("notes",e.target.value)}
        />
      </div>

      {/* AI Estimator */}
      <div style={{ marginTop:14, background:C.purpleSoft, borderRadius:10, padding:"12px 14px" }}>
        <button onClick={()=>setShowEst(v=>!v)} style={{
          background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", gap:6, color:C.purple, fontWeight:600, fontSize:13, padding:0,
        }}>
          <span style={{ fontSize:16 }}>✨</span>
          {showEst ? "Hide estimator" : "Don't know the hours? Let AI estimate"}
        </button>

        {showEst && (
          <div style={{ marginTop:10 }}>
            <label style={{ ...lblStyle, color:C.purple }}>Paste your assignment description / brief</label>
            <textarea
              style={{ ...inpStyle(), height:100, resize:"vertical", fontSize:13 }}
              placeholder="e.g. Write a 1500-word report on software design patterns. Include UML diagrams and code examples. Due Week 10..."
              value={desc}
              onChange={e=>setDesc(e.target.value)}
            />
            <div style={{ display:"flex", gap:10, marginTop:8, alignItems:"center" }}>
              <button onClick={estimateHours} disabled={estimating||!desc.trim()} style={{
                padding:"8px 18px", borderRadius:8, border:"none",
                background: estimating||!desc.trim() ? C.g200 : C.purple,
                color: estimating||!desc.trim() ? C.g400 : "white",
                fontSize:13, fontWeight:600, cursor: estimating||!desc.trim() ? "not-allowed" : "pointer",
                fontFamily:"inherit",
              }}>{estimating ? "Estimating…" : "Estimate Hours"}</button>

              {estimation && estimation.hours && (
                <div style={{ flex:1, background:C.white, borderRadius:8, padding:"8px 12px", border:`1px solid ${C.purpleMid}` }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.purple, margin:0 }}>
                    Estimated: {estimation.hours}h
                    <span style={{ fontSize:11, fontWeight:400, color:C.g400, marginLeft:6 }}>→ auto-filled above</span>
                  </p>
                  {estimation.reasoning && (
                    <p style={{ fontSize:12, color:C.g500, margin:"3px 0 0" }}>{estimation.reasoning}</p>
                  )}
                </div>
              )}
              {estimation && !estimation.hours && (
                <p style={{ fontSize:12, color:C.red }}>{estimation.reasoning}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:10, marginTop:16 }}>
        <button onClick={()=>{if(form.name){onAdd(form);onClose();}}} style={{
          padding:"9px 22px", borderRadius:9, border:"none", background:C.purple,
          color:"white", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
        }}>Add Task</button>
        <button onClick={onClose} style={{
          padding:"9px 18px", borderRadius:9, border:`1.5px solid ${C.g200}`,
          background:"transparent", color:C.g500, fontSize:14, cursor:"pointer", fontFamily:"inherit",
        }}>Cancel</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────── */
function EmptyState({ text }) {
  return (
    <div style={{ textAlign:"center", padding:"52px 0" }}>
      <Ico name="ListChecks" size={34} color={C.g200}/>
      <p style={{ marginTop:12, fontSize:14, color:C.g400 }}>{text}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE: DASHBOARD (redesigned)
───────────────────────────────────────── */
function DashboardPage({ tasks, onToggle, onDelete, onAdd, onEdit, showAdd, setShowAdd, user }) {
  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr  = now.toLocaleDateString("en-AU", { weekday:"long", day:"numeric", month:"long" });
  const todayName = now.toLocaleDateString("en-US", { weekday:"long" }); // e.g. "Monday"

  // Stat counts
  const active    = tasks.filter(t => !t.completed);
  const done      = tasks.filter(t =>  t.completed);
  const urgent    = active.filter(t => ["Critical","Overdue"].includes(getUrgency(t).tag));

  // Today's Focus — top 3 most urgent active tasks
  const focusTasks = [...active]
    .filter(t => t.deadline)
    .sort((a,b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  // Countdown: max days used for bar width
  const maxDays = active.length
    ? Math.max(...active.filter(t=>t.deadline).map(t => Math.max(getUrgency(t).days, 0)), 1)
    : 60;

  // Today's AI schedule from localStorage
  const savedSchedule = (() => {
    try { return JSON.parse(localStorage.getItem("planzy_schedule")); } catch { return null; }
  })();
  const todaySchedule = savedSchedule
    ? savedSchedule.find(d => d.day === todayName) || null
    : null;
  const upcomingBlocks = todaySchedule
    ? todaySchedule.blocks.filter(b => {
        const [h,m] = b.startTime.split(":").map(Number);
        return h * 60 + m >= hour * 60 + now.getMinutes();
      }).slice(0, 5)
    : [];

  // Total study hours needed
  const totalHours = active.reduce((s,t) => s + (+t.studyTime||0), 0);

  const col = { display:"flex", flexDirection:"column", gap:16 };

  const sectionCard = (children, extra={}) => ({
    background:C.white, borderRadius:14, border:`1px solid ${C.g200}`,
    padding:"20px 22px", ...extra,
  });

  return (
    <div style={{ padding:"36px 40px", maxWidth:960 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:700, color:C.g900, margin:0, letterSpacing:"-0.5px" }}>
          {greeting}, {user ? user.name.split(" ")[0] : "there"} 👋
        </h1>
        <p style={{ color:C.g400, fontSize:14, marginTop:5 }}>{dateStr}</p>
      </div>

      {/* ── Mini stats row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total Tasks",  value:tasks.length, icon:"ListChecks",    color:C.purple, bg:C.purpleSoft },
          { label:"Urgent",       value:urgent.length, icon:"AlertTriangle", color:C.red,    bg:C.redSoft   },
          { label:"In Progress",  value:active.length, icon:"Clock",         color:C.amber,  bg:C.amberSoft },
          { label:"Completed",    value:done.length,   icon:"Check",         color:C.green,  bg:C.greenSoft },
        ].map(s=>(
          <div key={s.label} style={{ background:C.white, borderRadius:12, border:`1px solid ${C.g200}`, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ico name={s.icon} size={17} color={s.color} strokeWidth={2}/>
            </div>
            <div>
              <p style={{ fontSize:22, fontWeight:700, color:C.g900, margin:0, lineHeight:1 }}>{s.value}</p>
              <p style={{ fontSize:11, color:C.g400, margin:"3px 0 0" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2-column layout ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"start" }}>

        {/* LEFT COLUMN */}
        <div style={col}>

          {/* Today's Focus */}
          <div style={sectionCard()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h2 style={{ fontSize:14, fontWeight:700, color:C.g900, margin:0, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                Today's Focus
              </h2>
              <button onClick={()=>setShowAdd(v=>!v)} style={{
                display:"flex", alignItems:"center", gap:5, padding:"6px 12px",
                borderRadius:8, border:"none", background:C.purple, color:"white",
                fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
              }}>
                <Ico name="Plus" size={13} color="white"/> Add Task
              </button>
            </div>
            {showAdd && <AddTaskForm onAdd={onAdd} onClose={()=>setShowAdd(false)}/>}
            {focusTasks.length === 0 ? (
              <p style={{ fontSize:13, color:C.g400, textAlign:"center", padding:"20px 0" }}>No active tasks — add one above!</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {focusTasks.map(t => {
                  const u = getUrgency(t);
                  const daily = getDailyHours(t);
                  return (
                    <div key={t._id} style={{
                      display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                      borderRadius:10, background:u.bg, border:`1px solid ${u.color}22`,
                      borderLeft:`3px solid ${u.color}`,
                    }}>
                      <button onClick={()=>onToggle(t)} style={{
                        width:20, height:20, borderRadius:5, flexShrink:0,
                        border:`2px solid ${u.color}`, background:"transparent",
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        {t.completed && <Ico name="Check" size={11} color={u.color} strokeWidth={3}/>}
                      </button>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:C.g800, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</p>
                        <p style={{ fontSize:11, color:u.color, margin:"2px 0 0" }}>
                          {u.days < 0 ? `${Math.abs(u.days)}d overdue` : u.days === 0 ? "Due today!" : `${u.days} days left`}
                          {daily && ` · ${daily}h/day`}
                        </p>
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:u.color, background:C.white, padding:"2px 8px", borderRadius:20, flexShrink:0 }}>
                        {u.tag}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deadline Countdown */}
          {active.filter(t=>t.deadline).length > 0 && (
            <div style={sectionCard()}>
              <h2 style={{ fontSize:14, fontWeight:700, color:C.g900, margin:"0 0 16px", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                Deadline Countdown
              </h2>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[...active].filter(t=>t.deadline)
                  .sort((a,b) => new Date(a.deadline)-new Date(b.deadline))
                  .slice(0, 5)
                  .map(t => {
                    const u = getUrgency(t);
                    const pct = Math.max(0, Math.min(100, 100 - (u.days / maxDays * 100)));
                    return (
                      <div key={t._id}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ fontSize:13, fontWeight:500, color:C.g700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"70%" }}>{t.name}</span>
                          <span style={{ fontSize:12, fontWeight:600, color:u.color, flexShrink:0 }}>
                            {u.days < 0 ? "Overdue" : u.days === 0 ? "Today" : `${u.days}d`}
                          </span>
                        </div>
                        <div style={{ height:7, background:C.g100, borderRadius:99, overflow:"hidden" }}>
                          <div style={{
                            height:"100%", borderRadius:99, width:pct+"%",
                            background: u.color,
                            transition:"width 0.6s ease",
                          }}/>
                        </div>
                        <p style={{ fontSize:11, color:C.g400, margin:"3px 0 0" }}>
                          {t.deadline ? fmtDate(t.deadline) : ""}{t.studyTime ? ` · ${t.studyTime}h needed` : ""}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={col}>

          {/* Today's Schedule */}
          <div style={sectionCard()}>
            <h2 style={{ fontSize:14, fontWeight:700, color:C.g900, margin:"0 0 14px", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              Today — {todayName}
            </h2>
            {!todaySchedule ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <Ico name="BrainCircuit" size={28} color={C.g200}/>
                <p style={{ fontSize:13, color:C.g400, marginTop:8 }}>No schedule yet</p>
                <p style={{ fontSize:12, color:C.g300, marginTop:4 }}>Go to AI Schedule → Generate</p>
              </div>
            ) : upcomingBlocks.length === 0 ? (
              <p style={{ fontSize:13, color:C.g400, textAlign:"center", padding:"16px 0" }}>All done for today! 🎉</p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {upcomingBlocks.map((block,i) => {
                  const s = BLOCK_STYLES[block.type] || BLOCK_STYLES.personal;
                  return (
                    <div key={i} style={{
                      display:"flex", gap:12, alignItems:"flex-start",
                      padding:"9px 12px", borderRadius:9,
                      background:s.bg, border:`1px solid ${s.border}`,
                    }}>
                      <div style={{ flexShrink:0, textAlign:"right", minWidth:40 }}>
                        <p style={{ fontSize:12, fontWeight:600, color:s.color, margin:0 }}>{block.startTime}</p>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:s.color, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{block.task}</p>
                        {block.note && <p style={{ fontSize:11, color:s.color, opacity:0.7, margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{block.note}</p>}
                      </div>
                      <span style={{ fontSize:11, color:s.color, flexShrink:0, opacity:0.8 }}>{block.duration}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Study Overview */}
          <div style={sectionCard()}>
            <h2 style={{ fontSize:14, fontWeight:700, color:C.g900, margin:"0 0 16px", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              Study Overview
            </h2>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { label:"Total hours needed",  value: totalHours + "h",          color:C.purple },
                { label:"Active tasks",         value: active.length,             color:C.amber  },
                { label:"Completed",            value: done.length + " tasks",    color:C.green  },
                { label:"Completion rate",
                  value: tasks.length ? Math.round(done.length/tasks.length*100)+"%" : "—",
                  color:C.blue },
              ].map(s=>(
                <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:10, borderBottom:`1px solid ${C.g100}` }}>
                  <span style={{ fontSize:13, color:C.g500 }}>{s.label}</span>
                  <span style={{ fontSize:15, fontWeight:700, color:s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Completion bar */}
            {tasks.length > 0 && (
              <div style={{ marginTop:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.g400 }}>Overall progress</span>
                  <span style={{ fontSize:12, fontWeight:600, color:C.green }}>{Math.round(done.length/tasks.length*100)}%</span>
                </div>
                <div style={{ height:8, background:C.g100, borderRadius:99, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:99,
                    width: Math.round(done.length/tasks.length*100)+"%",
                    background:`linear-gradient(90deg, ${C.purple}, ${C.blue})`,
                    transition:"width 0.6s ease",
                  }}/>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE: TASKS
───────────────────────────────────────── */
function TasksPage({ tasks, onToggle, onDelete, onAdd, onEdit, showAdd, setShowAdd }) {
  const [filter,setFilter]=useState("all");
  const counts={ all:tasks.length, active:tasks.filter(t=>!t.completed).length,
    urgent:tasks.filter(t=>!t.completed&&["Critical","Overdue"].includes(getUrgency(t).tag)).length,
    done:tasks.filter(t=>t.completed).length };
  const filtered=tasks.filter(t=>{
    if(filter==="active") return !t.completed;
    if(filter==="urgent") return !t.completed&&["Critical","Overdue"].includes(getUrgency(t).tag);
    if(filter==="done")   return t.completed;
    return true;
  }).sort((a,b)=>{
    if(a.completed!==b.completed) return a.completed?1:-1;
    return new Date(a.deadline)-new Date(b.deadline);
  });
  const TABS=[{id:"all",label:`All (${counts.all})`},{id:"active",label:`Active (${counts.active})`},
    {id:"urgent",label:`Urgent (${counts.urgent})`},{id:"done",label:`Done (${counts.done})`}];
  return (
    <div style={{ padding:"36px 40px", maxWidth:860 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:C.g900, margin:0 }}>My Tasks</h1>
          <p style={{ color:C.g400, fontSize:14, marginTop:4 }}>Track and manage your assignments</p>
        </div>
        <button onClick={()=>setShowAdd(v=>!v)} style={{
          display:"flex", alignItems:"center", gap:7, padding:"10px 18px",
          borderRadius:10, border:"none", background:C.purple, color:"white",
          fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
        }}><Ico name="Plus" size={16} color="white"/> Add Task</button>
      </div>
      <div style={{ display:"flex", gap:3, marginBottom:20, background:C.g100, borderRadius:11, padding:4 }}>
        {TABS.map(({id,label})=>(
          <button key={id} onClick={()=>setFilter(id)} style={{
            flex:1, padding:"8px 10px", borderRadius:8, border:"none",
            background:filter===id?C.white:"transparent", color:filter===id?C.g800:C.g400,
            fontWeight:filter===id?600:400, fontSize:13, cursor:"pointer", fontFamily:"inherit",
            boxShadow:filter===id?"0 1px 3px rgba(0,0,0,0.08)":"none",
          }}>{label}</button>
        ))}
      </div>
      {showAdd&&<AddTaskForm onAdd={onAdd} onClose={()=>setShowAdd(false)}/>}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.length===0?<EmptyState text="No tasks here."/>
          :filtered.map(t=><TaskCard key={t._id} task={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit}/>)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE: MY ROUTINE
───────────────────────────────────────── */
function RoutinePage({ routine, onChange }) {
  const [showAdd,setShowAdd]=useState(false);
  const [editingEventId,setEditingEventId]=useState(null);
  const [newEv,setNewEv]=useState({ name:"", type:"class", days:[], startTime:"09:00", endTime:"10:00" });

  const updateTime=(i,field,value)=>{
    const days=[...routine.days]; days[i]={...days[i],[field]:value};
    onChange({...routine,days});
  };
  const toggleDay=(day)=>{
    const days=newEv.days.includes(day)?newEv.days.filter(d=>d!==day):[...newEv.days,day];
    setNewEv(e=>({...e,days}));
  };
  const openAddForm=()=>{ setEditingEventId(null); setNewEv({name:"",type:"class",days:[],startTime:"09:00",endTime:"10:00"}); setShowAdd(true); };
  const openEditForm=(ev)=>{ setEditingEventId(ev.id); setNewEv({name:ev.name,type:ev.type,days:[...ev.days],startTime:ev.startTime,endTime:ev.endTime}); setShowAdd(true); };
  const saveEvent=()=>{
    if(!newEv.name||newEv.days.length===0) return;
    if(editingEventId){
      onChange({...routine,events:routine.events.map(e=>e.id===editingEventId?{...newEv,id:editingEventId}:e)});
    } else {
      onChange({...routine,events:[...routine.events,{...newEv,id:Date.now().toString()}]});
    }
    setNewEv({name:"",type:"class",days:[],startTime:"09:00",endTime:"10:00"});
    setEditingEventId(null); setShowAdd(false);
  };
  const removeEvent=(id)=>onChange({...routine,events:routine.events.filter(e=>e.id!==id)});

  const TimeInput=({value,onChange:onCh})=>(
    <input type="time" value={value} onChange={e=>onCh(e.target.value)}
      onClick={e=>{ try { e.target.showPicker(); } catch(err){} }}
      style={{
        padding:"7px 10px", borderRadius:8, fontSize:13, width:"100%",
        border:`1.5px solid ${C.g200}`, outline:"none", color:C.g800,
        fontFamily:"inherit", background:C.white, boxSizing:"border-box", cursor:"pointer",
      }}/>
  );

  return (
    <div style={{ padding:"36px 40px", maxWidth:920 }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:C.g900, margin:0 }}>My Routine</h1>
        <p style={{ color:C.g400, fontSize:14, marginTop:4 }}>AI will plan around your fixed schedule — saved automatically</p>
      </div>

      {/* Wake & Sleep */}
      <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.g200}`, padding:"24px", marginBottom:24 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:C.g900, margin:"0 0 18px" }}>Wake &amp; Sleep Times</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10 }}>
          {routine.days.map((d,i)=>(
            <div key={d.day} style={{ background:C.g50, borderRadius:12, border:`1px solid ${C.g200}`, padding:12 }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.g500, margin:"0 0 12px", letterSpacing:"0.5px" }}>
                {DAY_SHORT[i].toUpperCase()}
              </p>
              <p style={{ ...lblStyle, fontSize:11 }}>Wake up</p>
              <TimeInput value={d.wakeUp} onChange={v=>updateTime(i,"wakeUp",v)}/>
              <p style={{ ...lblStyle, fontSize:11, marginTop:8 }}>Sleep</p>
              <TimeInput value={d.sleep} onChange={v=>updateTime(i,"sleep",v)}/>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Events */}
      <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.g200}`, padding:"24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:C.g900, margin:0 }}>Fixed Weekly Events</h2>
          <button onClick={openAddForm} style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
            borderRadius:9, border:"none", background:C.purple, color:"white",
            fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
          }}><Ico name="Plus" size={14} color="white"/> Add Event</button>
        </div>

        {/* Add form */}
        {showAdd&&(
          <div style={{ background:C.purpleSoft, border:`1.5px solid ${C.purpleMid}`, borderRadius:12, padding:"18px 20px", marginBottom:16 }}>
            <p style={{ fontSize:14, fontWeight:700, color:C.purple, margin:"0 0 14px" }}>{editingEventId?"Edit Event":"New Event"}</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div>
                <label style={lblStyle}>Event name *</label>
                <input style={inpStyle()} placeholder="e.g. COMP2123 Lecture"
                  value={newEv.name} onChange={e=>setNewEv(v=>({...v,name:e.target.value}))}/>
              </div>
              <div>
                <label style={lblStyle}>Type</label>
                <select style={inpStyle()} value={newEv.type} onChange={e=>setNewEv(v=>({...v,type:e.target.value}))}>
                  {Object.entries(EVENT_TYPES).map(([k,{label}])=><option key={k} value={k}>{label}</option>)}
                </select>
              </div>
              <div>
                <label style={lblStyle}>Start time</label>
                <TimeInput value={newEv.startTime} onChange={v=>setNewEv(e=>({...e,startTime:v}))}/>
              </div>
              <div>
                <label style={lblStyle}>End time</label>
                <TimeInput value={newEv.endTime} onChange={v=>setNewEv(e=>({...e,endTime:v}))}/>
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lblStyle}>Repeat on *</label>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {WEEK_DAYS.map((day,i)=>{
                  const on=newEv.days.includes(day);
                  return (
                    <button key={day} onClick={()=>toggleDay(day)} style={{
                      padding:"6px 12px", borderRadius:8,
                      border:`1.5px solid ${on?C.purple:C.g200}`,
                      background:on?C.purple:C.white, color:on?"white":C.g500,
                      fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                    }}>{DAY_SHORT[i]}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={saveEvent} style={{
                padding:"9px 20px", borderRadius:9, border:"none",
                background:C.purple, color:"white", fontSize:13, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit",
              }}>{editingEventId?"Update Event":"Save Event"}</button>
              <button onClick={()=>{ setShowAdd(false); setEditingEventId(null); setNewEv({name:"",type:"class",days:[],startTime:"09:00",endTime:"10:00"}); }} style={{
                padding:"9px 16px", borderRadius:9, border:`1.5px solid ${C.g200}`,
                background:"transparent", color:C.g500, fontSize:13,
                cursor:"pointer", fontFamily:"inherit",
              }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Events list */}
        {routine.events.length===0?(
          <div style={{ textAlign:"center", padding:"32px 0" }}>
            <Ico name="Calendar" size={30} color={C.g200}/>
            <p style={{ marginTop:10, fontSize:13, color:C.g400 }}>No fixed events yet — add your class schedule, work shifts, meals…</p>
          </div>
        ):(
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {routine.events.map(ev=>{
              const t=EVENT_TYPES[ev.type]||EVENT_TYPES.personal;
              return (
                <div key={ev.id} style={{
                  display:"flex", alignItems:"center", gap:14,
                  background:t.bg, border:`1px solid ${C.g200}`,
                  borderLeft:`4px solid ${t.color}`, borderRadius:10, padding:"12px 16px",
                }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:t.color, margin:0 }}>{ev.name}</p>
                      <span style={{ fontSize:11, fontWeight:600, color:t.color,
                        background:C.white, padding:"2px 8px", borderRadius:20 }}>{t.label}</span>
                    </div>
                    <div style={{ display:"flex", gap:12 }}>
                      <span style={{ fontSize:12, color:t.color, opacity:0.8 }}>{ev.startTime} – {ev.endTime}</span>
                      <span style={{ fontSize:12, color:t.color, opacity:0.7 }}>
                        {ev.days.map(d=>DAY_SHORT[WEEK_DAYS.indexOf(d)]).join(", ")}
                      </span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={()=>openEditForm(ev)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4 }}>
                      <Ico name="Edit2" size={15} color={t.color}/>
                    </button>
                    <button onClick={()=>removeEvent(ev.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:4 }}>
                      <Ico name="Trash2" size={15} color={t.color}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE: AI SCHEDULE
───────────────────────────────────────── */
function SchedulePage({ tasks, routine, token }) {
  const [schedule,setSchedule]=useState(()=>{
    try { const s=localStorage.getItem("planzy_schedule"); return s?JSON.parse(s):null; }
    catch { return null; }
  });
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [activeDay,setActiveDay]=useState(0);

  const active=tasks.filter(t=>!t.completed&&t.deadline&&t.studyTime);

  const generate=async()=>{
    setLoading(true); setError(null);
    try {
      const res=await fetch(BASE + "/api/schedule/generate",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ tasks:active, routine }),
      });
      if(!res.ok) throw new Error(await res.text());
      const data=await res.json();
      localStorage.setItem("planzy_schedule", JSON.stringify(data.week));
      setSchedule(data.week); setActiveDay(0);
    } catch(e) {
      setError("Could not generate schedule. Check server is running and OPENAI_API_KEY is set.");
    }
    setLoading(false);
  };

  const canGenerate=!loading&&active.length>0;

  return (
    <div style={{ padding:"36px 40px", maxWidth:900 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:C.g900, margin:0 }}>AI Schedule</h1>
          <p style={{ color:C.g400, fontSize:14, marginTop:4 }}>GPT creates a weekly timetable around your routine &amp; deadlines</p>
        </div>
        <button onClick={generate} disabled={!canGenerate} style={{
          display:"flex", alignItems:"center", gap:8, padding:"10px 20px",
          borderRadius:10, border:"none",
          background:canGenerate?C.purple:C.g200, color:canGenerate?"white":C.g400,
          fontSize:14, fontWeight:600, cursor:canGenerate?"pointer":"not-allowed", fontFamily:"inherit",
        }}>
          <Ico name="BrainCircuit" size={17} color={canGenerate?"white":C.g400}/>
          {loading?"Generating…":schedule?"Regenerate":"Generate Schedule"}
        </button>
        {schedule&&!loading&&(
          <button onClick={()=>{ localStorage.removeItem("planzy_schedule"); setSchedule(null); }} style={{
            padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.g200}`,
            background:"transparent", color:C.g400, fontSize:13,
            cursor:"pointer", fontFamily:"inherit",
          }}>Clear</button>
        )}
      </div>

      {active.length===0&&!loading&&(
        <div style={{ textAlign:"center", padding:"64px 24px", background:C.white, borderRadius:16, border:`1px solid ${C.g200}` }}>
          <Ico name="BrainCircuit" size={36} color={C.g300}/>
          <p style={{ color:C.g400, marginTop:12, fontSize:15 }}>Add tasks with deadlines and study hours first.</p>
        </div>
      )}

      {loading&&(
        <div style={{ textAlign:"center", padding:"64px 24px", background:C.purpleSoft, borderRadius:16, border:`1px solid ${C.purpleMid}` }}>
          <div style={{ fontSize:36, marginBottom:12 }}>✨</div>
          <p style={{ color:C.purple, fontSize:15, fontWeight:600 }}>AI is building your weekly plan…</p>
          <p style={{ color:C.purple, fontSize:13, marginTop:6, opacity:0.7 }}>Balancing study, your routine, breaks, and personal time</p>
        </div>
      )}

      {error&&(
        <div style={{ background:C.redSoft, border:`1px solid #FCA5A5`, borderRadius:12, padding:"14px 18px", marginBottom:20, fontSize:13, color:C.red }}>
          ⚠️ {error}
        </div>
      )}

      {schedule&&!loading&&(
        <>
          <div style={{ display:"flex", gap:4, marginBottom:20, background:C.g100, borderRadius:12, padding:5 }}>
            {WEEK_DAYS.map((day,i)=>{
              const hasBlocks=schedule[i]?.blocks?.length>0;
              const isOn=activeDay===i;
              return (
                <button key={day} onClick={()=>setActiveDay(i)} style={{
                  flex:1, padding:"8px 4px", borderRadius:9, border:"none",
                  background:isOn?C.white:"transparent", color:isOn?C.g900:C.g400,
                  fontWeight:isOn?600:400, fontSize:13, cursor:"pointer", fontFamily:"inherit",
                  boxShadow:isOn?"0 1px 4px rgba(0,0,0,0.1)":"none",
                }}>
                  <div>{DAY_SHORT[i]}</div>
                  {hasBlocks&&<div style={{ width:5,height:5,borderRadius:"50%",background:isOn?C.purple:C.g300,margin:"4px auto 0" }}/>}
                </button>
              );
            })}
          </div>

          {schedule[activeDay]&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <h2 style={{ fontSize:18, fontWeight:700, color:C.g900, margin:0 }}>{WEEK_DAYS[activeDay]}</h2>
                {schedule[activeDay].note&&(
                  <p style={{ fontSize:13, color:C.purple, marginTop:6, background:C.purpleSoft,
                    display:"inline-block", padding:"4px 12px", borderRadius:20, fontWeight:500 }}>
                    {schedule[activeDay].note}
                  </p>
                )}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {(schedule[activeDay].blocks||[]).map((block,j)=>{
                  const s=BLOCK_STYLES[block.type]||BLOCK_STYLES.personal;
                  return (
                    <div key={j} style={{ display:"flex", gap:16, alignItems:"stretch" }}>
                      <div style={{ width:90, flexShrink:0, paddingTop:14, textAlign:"right" }}>
                        <p style={{ fontSize:13, fontWeight:600, color:C.g500, margin:0 }}>{block.startTime}</p>
                        <p style={{ fontSize:11, color:C.g300, margin:"2px 0 0" }}>{block.endTime}</p>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:s.color,marginTop:16,flexShrink:0 }}/>
                        <div style={{ width:2,flex:1,background:C.g200,minHeight:20 }}/>
                      </div>
                      <div style={{ flex:1, background:s.bg, border:`1px solid ${s.border}`, borderRadius:12, padding:"12px 16px", marginBottom:4 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                          <p style={{ fontSize:14, fontWeight:600, color:s.color, margin:0 }}>{block.task}</p>
                          <span style={{ fontSize:11, fontWeight:600, color:s.color, background:C.white,
                            padding:"2px 8px", borderRadius:20, border:`1px solid ${s.border}`,
                            flexShrink:0, marginLeft:8 }}>{block.duration}</span>
                        </div>
                        {block.note&&<p style={{ fontSize:12, color:s.color, opacity:0.75, margin:"5px 0 0" }}>{block.note}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE: CALENDAR
───────────────────────────────────────── */
const CAL_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function CalendarPage({ tasks, onToggle, onDelete, onEdit }) {
  const now = new Date();
  const [cur, setCur]         = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(null);

  const year  = cur.getFullYear();
  const month = cur.getMonth();

  const prev = () => setCur(new Date(year, month-1, 1));
  const next = () => setCur(new Date(year, month+1, 1));

  // Calendar grid: pad start with nulls
  let startDow = new Date(year, month, 1).getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [...Array(startDow).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const pad = n => String(n).padStart(2,"0");
  const dateStr = day => `${year}-${pad(month+1)}-${pad(day)}`;
  const getTasksForDay = day => tasks.filter(t => t.deadline === dateStr(day));

  const isToday = day => {
    const t = new Date();
    return day===t.getDate() && month===t.getMonth() && year===t.getFullYear();
  };

  const selectedTasks = selected ? getTasksForDay(selected) : [];

  return (
    <div style={{ padding:"36px 40px", maxWidth:960 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:C.g900, margin:0 }}>Calendar</h1>
          <p style={{ color:C.g400, fontSize:14, marginTop:4 }}>Tasks by deadline</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={prev} style={{
            width:34, height:34, borderRadius:8, border:`1px solid ${C.g200}`,
            background:C.white, cursor:"pointer", fontSize:16, display:"flex",
            alignItems:"center", justifyContent:"center",
          }}>‹</button>
          <span style={{ fontSize:16, fontWeight:700, color:C.g900, minWidth:160, textAlign:"center" }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={next} style={{
            width:34, height:34, borderRadius:8, border:`1px solid ${C.g200}`,
            background:C.white, cursor:"pointer", fontSize:16, display:"flex",
            alignItems:"center", justifyContent:"center",
          }}>›</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.g200}`, overflow:"hidden" }}>
        {/* Day headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:C.g50, borderBottom:`1px solid ${C.g200}` }}>
          {CAL_DAYS.map(d=>(
            <div key={d} style={{ padding:"10px 0", textAlign:"center", fontSize:12, fontWeight:700, color:C.g500, letterSpacing:"0.5px" }}>
              {d.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {cells.map((day,i)=>{
            const dayTasks = day ? getTasksForDay(day) : [];
            const isSelected = day===selected;
            const todayCell = day && isToday(day);
            return (
              <div key={i} onClick={()=>day&&setSelected(day===selected?null:day)}
                style={{
                  minHeight:88, padding:"8px 8px 6px", cursor:day?"pointer":"default",
                  borderRight:`1px solid ${C.g100}`, borderBottom:`1px solid ${C.g100}`,
                  background: isSelected?C.purpleSoft : !day?C.g50 : C.white,
                  transition:"background 0.1s",
                }}>
                {day&&(
                  <>
                    <div style={{
                      width:26, height:26, borderRadius:"50%",
                      background:todayCell?C.purple:"transparent",
                      color:todayCell?C.white: isSelected?C.purple:C.g700,
                      fontWeight:todayCell||isSelected?700:400,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:13, marginBottom:5,
                    }}>{day}</div>
                    {dayTasks.slice(0,3).map((t,j)=>{
                      const u = getUrgency(t);
                      return (
                        <div key={j} style={{
                          fontSize:10, fontWeight:600, color:t.completed?C.g400:u.color,
                          background:t.completed?C.g100:u.bg,
                          borderRadius:4, padding:"2px 6px", marginBottom:2,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                          textDecoration:t.completed?"line-through":"none",
                        }}>{t.name}</div>
                      );
                    })}
                    {dayTasks.length>3&&(
                      <div style={{ fontSize:10, color:C.g400, marginTop:1 }}>+{dayTasks.length-3} more</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selected&&(
        <div style={{ marginTop:20 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:C.g900, margin:"0 0 12px" }}>
            {selected} {MONTHS[month]} {year}
            {selectedTasks.length===0&&<span style={{ fontSize:14, color:C.g400, fontWeight:400 }}> — no tasks due</span>}
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {selectedTasks.map(t=>(
              <TaskCard key={t._id} task={t} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   AUTH PAGE (Login / Register)
───────────────────────────────────────── */
function AuthPage({ onLogin }) {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ name:"", email:"", password:"" });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.email||!form.password) return setError("Please fill all fields");
    if (mode==="register"&&!form.name) return setError("Please enter your name");
    setLoading(true); setError(null);
    try {
      const url = mode==="login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(BASE + url, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.token, data.user);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const handleKey = (e) => { if(e.key==="Enter") submit(); };

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif",
    }}>
      <div style={{ width:400 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:52, height:52, borderRadius:14, background:C.purple,
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 14px",
          }}>
            <Ico name="BrainCircuit" size={26} color="white"/>
          </div>
          <h1 style={{ fontSize:26, fontWeight:700, color:C.g900, margin:0, letterSpacing:"-0.5px" }}>Planzy</h1>
          <p style={{ color:C.g400, fontSize:14, marginTop:4 }}>AI Study Planner</p>
        </div>

        {/* Card */}
        <div style={{
          background:C.white, borderRadius:18, border:`1px solid ${C.g200}`,
          padding:"32px 36px",
        }}>
          {/* Tab switch */}
          <div style={{ display:"flex", background:C.g100, borderRadius:10, padding:4, marginBottom:24 }}>
            {["login","register"].map(m=>(
              <button key={m} onClick={()=>{ setMode(m); setError(null); }} style={{
                flex:1, padding:"9px 0", borderRadius:8, border:"none",
                background:mode===m?C.white:"transparent",
                color:mode===m?C.g900:C.g400,
                fontWeight:mode===m?600:400, fontSize:14,
                cursor:"pointer", fontFamily:"inherit",
                boxShadow:mode===m?"0 1px 3px rgba(0,0,0,0.08)":"none",
              }}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="register"&&(
              <div>
                <label style={lblStyle}>Full name</label>
                <input style={inpStyle()} placeholder="Vy Tran" value={form.name}
                  onChange={e=>set("name",e.target.value)} onKeyDown={handleKey}/>
              </div>
            )}
            <div>
              <label style={lblStyle}>Email</label>
              <input type="email" style={inpStyle()} placeholder="you@example.com" value={form.email}
                onChange={e=>set("email",e.target.value)} onKeyDown={handleKey}/>
            </div>
            <div>
              <label style={lblStyle}>Password</label>
              <input type="password" style={inpStyle()} placeholder="••••••••" value={form.password}
                onChange={e=>set("password",e.target.value)} onKeyDown={handleKey}/>
            </div>
          </div>

          {/* Error */}
          {error&&(
            <div style={{
              marginTop:14, background:C.redSoft, border:`1px solid #FCA5A5`,
              borderRadius:8, padding:"10px 14px", fontSize:13, color:C.red,
            }}>⚠️ {error}</div>
          )}

          {/* Submit */}
          <button onClick={submit} disabled={loading} style={{
            width:"100%", marginTop:20, padding:"12px 0", borderRadius:10,
            border:"none", background:loading?C.g200:C.purple,
            color:loading?C.g400:"white", fontSize:15, fontWeight:600,
            cursor:loading?"not-allowed":"pointer", fontFamily:"inherit",
          }}>
            {loading?"Please wait…":mode==="login"?"Sign In":"Create Account"}
          </button>

          {/* Switch mode */}
          <p style={{ textAlign:"center", fontSize:13, color:C.g400, marginTop:16 }}>
            {mode==="login"?"Don't have an account? ":"Already have an account? "}
            <button onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(null); }} style={{
              background:"none", border:"none", color:C.purple, fontWeight:600,
              fontSize:13, cursor:"pointer", fontFamily:"inherit",
            }}>
              {mode==="login"?"Create one":"Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DEMO DATA
───────────────────────────────────────── */
const DEMO_TASKS = [
  { _id:"d1", name:"COMP2123 Assignment 2", deadline:new Date(Date.now()+2*86400000).toISOString().slice(0,10), studyTime:8, priority:3, completed:false },
  { _id:"d2", name:"INFO1111 Report",        deadline:new Date(Date.now()+7*86400000).toISOString().slice(0,10), studyTime:4, priority:2, completed:false },
  { _id:"d3", name:"MATH1002 Quiz Prep",     deadline:new Date(Date.now()+1*86400000).toISOString().slice(0,10), studyTime:2, priority:3, completed:false },
  { _id:"d4", name:"COMP2017 Lab Report",    deadline:new Date(Date.now()-1*86400000).toISOString().slice(0,10), studyTime:3, priority:1, completed:true  },
];

/* ─────────────────────────────────────────
   APP ROOT
───────────────────────────────────────── */
export default function App() {
  const [tasks,   setTasks]   = useState([]);
  const [nav,     setNav]     = useState("dashboard");
  const [showAdd, setShowAdd] = useState(false);

  const [token, setToken] = useState(()=>localStorage.getItem("planzy_token")||null);
  const [user,  setUser]  = useState(()=>{
    try { return JSON.parse(localStorage.getItem("planzy_user")); } catch { return null; }
  });

  const [routine, setRoutine] = useState(()=>{
    try { const s=localStorage.getItem("planzy_routine"); return s?JSON.parse(s):DEFAULT_ROUTINE; }
    catch { return DEFAULT_ROUTINE; }
  });

  useEffect(()=>{ localStorage.setItem("planzy_routine",JSON.stringify(routine)); },[routine]);
  useEffect(()=>{ if(token) fetchTasks(); },[token]);

  const authH = () => ({ "Content-Type":"application/json", "Authorization":"Bearer "+token });

  const handleLogin = (tok, usr) => {
    localStorage.setItem("planzy_token", tok);
    localStorage.setItem("planzy_user", JSON.stringify(usr));
    setToken(tok); setUser(usr);
  };

  const logout = () => {
    ["planzy_token","planzy_user","planzy_schedule"].forEach(k=>localStorage.removeItem(k));
    setToken(null); setUser(null); setTasks([]);
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(API, { headers: authH() });
      if (res.status===401) { logout(); return; }
      setTasks(await res.json());
    } catch {}
  };

  const addTask = async (form) => {
    const payload={...form,studyTime:+form.studyTime,priority:+form.priority,weight:+form.weight||0,notes:form.notes||''};
    try {
      const res=await fetch(API,{method:"POST",headers:authH(),body:JSON.stringify(payload)});
      const newTask=await res.json();
      setTasks(prev=>[...prev,newTask]);
    } catch {
      setTasks(prev=>[...prev,{...payload,_id:Date.now().toString(),completed:false}]);
    }
  };

  const toggleComplete = async (task) => {
    const updated={...task,completed:!task.completed};
    setTasks(prev=>prev.map(t=>t._id===task._id?updated:t));
    try {
      const res=await fetch(API+"/"+task._id,{method:"PUT",headers:authH(),body:JSON.stringify({completed:!task.completed})});
      const saved=await res.json();
      setTasks(prev=>prev.map(t=>t._id===saved._id?saved:t));
    } catch {}
  };

  const deleteTask = async (id) => {
    setTasks(prev=>prev.filter(t=>t._id!==id));
    try { await fetch(API+"/"+id,{method:"DELETE",headers:authH()}); } catch {}
  };

  const editTask = async (id, updates) => {
    const payload={...updates,studyTime:+updates.studyTime,priority:+updates.priority,weight:+updates.weight||0,notes:updates.notes||''};
    setTasks(prev=>prev.map(t=>t._id===id?{...t,...payload}:t));
    try {
      const res=await fetch(API+"/"+id,{method:"PUT",headers:authH(),body:JSON.stringify(payload)});
      const saved=await res.json();
      setTasks(prev=>prev.map(t=>t._id===saved._id?saved:t));
    } catch {}
  };

  if (!token) return <AuthPage onLogin={handleLogin}/>;

  const shared={tasks,onToggle:toggleComplete,onDelete:deleteTask,onAdd:addTask,onEdit:editTask,showAdd,setShowAdd};

  return (
    <div style={{
      display:"flex", height:"100vh",
      fontFamily:"'Segoe UI',system-ui,-apple-system,sans-serif",
      background:C.bg, overflow:"hidden" }}>
      <Sidebar active={nav} onChange={id=>{ setNav(id); setShowAdd(false); }} user={user} onLogout={logout}/>
      <main style={{ flex:1, overflowY:"auto" }}>
        {nav==="dashboard"&&<DashboardPage {...shared} user={user}/>}
        {nav==="tasks"    &&<TasksPage     {...shared}/>}
        {nav==="calendar" &&<CalendarPage  tasks={tasks} onToggle={toggleComplete} onDelete={deleteTask} onEdit={editTask}/>}
        {nav==="schedule" &&<SchedulePage  tasks={tasks} routine={routine} token={token}/>}
        {nav==="routine"  &&<RoutinePage   routine={routine} onChange={setRoutine}/>}
      </main>
    </div>
  );
}
