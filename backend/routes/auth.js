const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
    const { name, id, gsisId, course, year, username, password, role } = req.body;

    try {
        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if ID already exists
        const existingId = await User.findOne({ id });
        if (existingId) {
            return res.status(400).json({ message: 'ID already exists' });
        }

        // Validate COOP ID for faculty
        if (role === 'faculty' && !gsisId) {
            return res.status(400).json({ message: 'COOP ID is required for faculty members' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            id,
            gsisId: role === 'faculty' ? gsisId : null,  // Only set COOP ID for faculty
            course,
            year,
            username,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);  // Add detailed error logging
        res.status(500).json({ 
            message: 'Error creating user',
            error: error.message 
        });
    }
});

// routes/auth.js
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Ensure username and password are defined
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                role: user.role, 
                name: user.name,
                course: user.course,
                year: user.year,
                gsisId: user.role === 'faculty' ? user.gsisId : undefined  // Include COOP ID for faculty
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all accounts
router.get('/accounts', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete account
router.delete('/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Update account
router.put('/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // If password is being updated, hash it
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Update access for an admin account
router.patch('/accounts/access/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { hasAccess } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { id },
            { hasAccess },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Access updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all accounts
router.get('/accounts', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;