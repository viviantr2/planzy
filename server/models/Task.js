const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: String,
  deadline: String,
  priority: Number,
  studyTime: Number,

  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Task", TaskSchema);