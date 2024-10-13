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

router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res)=>{

  candidateId = req.params.candidateId

    userId = req.user.userData.id

  try {

    const candidate = await candidateSchema.findById(candidateId)

    if(!candidate){
      return res.status(404).json({ message: "Candidate not found" })
    }

    const user = await userSchema.findById(userId)

    if(!user){
      return res.status(404).json({ message: "User not found" }) 
    }

    if(user.isVoted){
      return res.status(403).json({ message: "You have already voted" })
    }

    if(user.role == 'admin'){
      return res.status(403).json({ message: "Admins cannot vote" })
    }
    
    candidate.votes.push({user: userId})
    candidate.voteCount++
    await candidate.save()

    user.isVoted = true
    await user.save()
    res.status(200).json({message: "Vote recorded successfully"})


  }catch(err){
    res.status(500).send("Internal server error");
  }
})

router.get("/vote/count", async (req, res) =>{
  try {
    const candidates = await candidateSchema.find().sort({voteCount: 'desc'})

    const record = candidates.map((data)=>{
      return {
        party: data.party,
        count: data.voteCount,
      }
    })

    return res.status(200).json(record)

  }catch(err){
    res.status(500).send("Internal server error");
  }
})

router.get("/chekcandidates", jwtAuthMiddleware, async (req, res) => {
  try{

    const candidates = await candidateSchema.find().sort({voteCount: 'desc'})

    const record = candidates.map((data)=>{
      return {
        name: data.name,
        party: data.party,
        count: data.voteCount,
      }
    })

    res.status(200).json(record)

  }catch(err){
    res.status(500).send("Internal server error");
  }
})

module.exports = router;
