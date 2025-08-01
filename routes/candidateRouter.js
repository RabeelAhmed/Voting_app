const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const candidateSchema = require("../models/candidate");
const userSchema = require("../models/user");
const path = require('path');

const checkAdminRole = async (userId) => {
    try {
        const user = await userSchema.findById(userId);
        return user.role === 'admin';
    } catch(err) {
        return false;
    }
}

// List candidates
router.get("/chekcandidates", jwtAuthMiddleware, async (req, res) => {
    try {
        const candidates = await candidateSchema.find().sort({voteCount: 'desc'});
        const user = await userSchema.findById(req.user.id);  // Changed here
        res.render('candidates/list', { 
            title: 'Candidates', 
            candidates, 
            user 
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading candidates');
        res.redirect('/');
    }
});

// View results
router.get("/vote/count", async (req, res) => {
    try {
        const candidates = await candidateSchema.find().sort({voteCount: 'desc'});
        const record = candidates.map((data) => {
            return {
                party: data.party,
                count: data.voteCount,
            }
        });
        
        res.render('candidates/results', { 
            title: 'Election Results', 
            candidates: record 
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading results');
        res.redirect('/');
    }
});

// Add new candidate form (admin only)
router.get("/add", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {  // Changed here
            req.flash('error_msg', 'Only admins can access this!');
            return res.redirect('/');
        }
        res.render('candidates/add', { title: 'Add Candidate' });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error accessing form');
        res.redirect('/');
    }
});

// Add new candidate (admin only)
router.post("/", jwtAuthMiddleware, async (req, res) => {
  
    try {
        // Check if user is admin
        const user = await userSchema.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            req.flash('error_msg', 'Unauthorized');
            return res.redirect('/');
        }
        
        const data = req.body;
        const newCandidate = new candidateSchema(data);
        await newCandidate.save();

        req.flash('success_msg', 'Candidate added successfully!');
        res.redirect('/candidate/chekcandidates');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error adding candidate');
        res.redirect('/candidate/add');
    }
});

// Edit candidate form (admin only)
router.get("/:candidateId/edit", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            req.flash('error_msg', 'Only admins can access this!');
            return res.redirect('/candidate/chekcandidates');
        }
        
        const candidate = await candidateSchema.findById(req.params.candidateId);
        if (!candidate) {
            req.flash('error_msg', 'Candidate not found');
            return res.redirect('/candidate/chekcandidates');
        }
        
        res.render('candidates/edit', { 
            title: 'Edit Candidate', 
            candidate 
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading candidate');
        res.redirect('/candidate/chekcandidates');
    }
});

// Update candidate (admin only)
router.post("/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            req.flash('error_msg', 'Only admins can access this!');
            return res.redirect('/candidate/chekcandidates');
        }

        const candidateId = req.params.candidateId;
        const updatedCandidate = req.body;

        const response = await candidateSchema.findByIdAndUpdate(
            candidateId, 
            updatedCandidate, 
            { new: true, runValidators: true }
        );

        if (!response) {
            req.flash('error_msg', 'Candidate not found');
            return res.redirect('/candidate/chekcandidates');
        }

        req.flash('success_msg', 'Candidate updated successfully!');
        res.redirect('/candidate/chekcandidates');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating candidate');
        res.redirect(`/candidate/${req.params.candidateId}/edit`);
    }
});

// Delete candidate (admin only)
router.post("/:candidateId/delete", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {  // Changed here
            req.flash('error_msg', 'Only admins can access this!');
            return res.redirect('/');
        }

        const candidateId = req.params.candidateId;
        const response = await candidateSchema.findByIdAndDelete(candidateId);

        if (!response) {
            req.flash('error_msg', 'Candidate not found');
            return res.redirect('/candidate/chekcandidates');
        }

        req.flash('success_msg', 'Candidate deleted successfully!');
        res.redirect('/candidate/chekcandidates');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting candidate');
        res.redirect('/candidate/chekcandidates');
    }
});

// Vote for candidate
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
    try {
        const candidateId = req.params.candidateId;
        const userId = req.user.id;  // Changed here

        const candidate = await candidateSchema.findById(candidateId);
        if (!candidate) {
            req.flash('error_msg', 'Candidate not found');
            return res.redirect('/candidate/chekcandidates');
        }

        const user = await userSchema.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/candidate/chekcandidates');
        }

        if (user.isVoted) {
            req.flash('error_msg', 'You have already voted');
            return res.redirect('/candidate/chekcandidates');
        }

        if (user.role === 'admin') {
            req.flash('error_msg', 'Admins cannot vote');
            return res.redirect('/candidate/chekcandidates');
        }
        
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();
        
        req.flash('success_msg', 'Vote recorded successfully!');
        res.redirect('/candidate/chekcandidates');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error recording vote');
        res.redirect('/candidate/chekcandidates');
    }
});

module.exports = router;