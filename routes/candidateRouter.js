const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const candidateSchema = require("../models/candidate");
const userSchema = require("../models/user");


const checkAdminRole = async (userId) => {

  try {
    const user = await userSchema.findById(userId);
     if(user.role === 'admin'){
      return true
     }

  }catch(err){
    return false
  }

}

// User signup
router.post("/",jwtAuthMiddleware, async (req, res) => {
  try {
    console.log(req.user.userData.id)
    if(!(await checkAdminRole(req.user.userData.id))){
      return res.status(403).json({ message: "Only admins can access this!" })
    }
    
    const data = req.body;

    const newCandidate = new candidateSchema(data)

    const response = await newCandidate.save()

    console.log("Data Saved!")

    res.status(200).send({ response: response });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});


// Update user candidate
router.put("/:candidateId",jwtAuthMiddleware, async (req, res) => {
  try {
    if(!checkAdminRole(req.user.userData.id))
      return res.status(403).json({ message: "Only admins can access this!" })

   const candidateId = req.params.candidateId

   const updatedCandidate = req.body

   const response = await candidateSchema.findByIdAndUpdate(candidateId, updatedCandidate, {
    new: true,
    runValidators: true
   })

   if(!response){
    return res.status(404).json({ message: "Candidate not found" })
   }

   res.status(200).send({ message: "Candidate Updated!" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});


router.delete("/:candidateId",jwtAuthMiddleware, async (req, res) => {
  try {
    if(!checkAdminRole(req.user.userData.id))
      return res.status(403).json({ message: "Only admins can access this!" })

    const candidateId = req.params.candidateId 

   const response = await candidateSchema.findByIdAndDelete(candidateId)

   if(!response){
    return res.status(404).json({ message: "Candidate not found" })
   }

   res.status(200).send({ message: "Candidate Deleted!" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
