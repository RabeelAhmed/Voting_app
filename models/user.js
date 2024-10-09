const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");


const userSchema = new mongoose.Schema({
  name: {
    type: String,    
    required: true,  
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  idCardNumber: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'voter'],
    default: 'voter'
  },
  isVoted: {
    type: Boolean,
    default: false
  }
  
});

const User = mongoose.model("User", userSchema);  
module.exports =User