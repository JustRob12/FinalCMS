const express = require('express');
const multer = require('multer'); // Import multer
const Food = require('../models/foodModel');
const router = express.Router();

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique file name
    }
});

// File filter to allow only jpg and png formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only .png and .jpg format allowed!'), false); // Reject the file
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter // Use the file filter
});

// Add a new food item with image upload
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const newFood = new Food({
            ...req.body,
            image: req.file ? req.file.path : null // Store image path if available
        });
        await newFood.save();
        res.status(201).json(newFood); // 201 Created
    } catch (error) {
        res.status(500).json({ message: 'Failed to add food item.', error: error.message });
    }
});

// Get all food items
router.get('/', async (req, res) => {
    try {
        const foods = await Food.find();
        res.status(200).json(foods); // 200 OK
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch food items.', error: error.message });
    }
});

// Update a food item (Edit)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const updatedFood = await Food.findByIdAndUpdate(req.params.id, {
            ...req.body,
            image: req.file ? req.file.path : undefined // Update image if provided
        }, { new: true, runValidators: true }); // New document and validate updated fields
        if (!updatedFood) {
            return res.status(404).json({ message: 'Food item not found.' }); // 404 Not Found
        }
        res.status(200).json(updatedFood); // 200 OK
    } catch (error) {
        res.status(500).json({ message: 'Failed to update food item.', error: error.message });
    }
});

// Delete a food item
router.delete('/:id', async (req, res) => {
    try {
        const deletedFood = await Food.findByIdAndDelete(req.params.id);
        if (!deletedFood) {
            return res.status(404).json({ message: 'Food item not found.' }); // 404 Not Found
        }
        res.status(200).json({ message: 'Food deleted successfully' }); // 200 OK
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete food item.', error: error.message });
    }
});

// Mark food item as Not Available
router.patch('/:id/availability', async (req, res) => {
    try {
        const updatedFood = await Food.findByIdAndUpdate(
            req.params.id,
            { available: req.body.available },
            { new: true }
        );
        if (!updatedFood) {
            return res.status(404).json({ message: 'Food item not found.' }); // 404 Not Found
        }
        res.status(200).json(updatedFood); // 200 OK
    } catch (error) {
        res.status(500).json({ message: 'Failed to update food availability.', error: error.message });
    }
});

// Decrement food quantity
router.patch('/:id/decrement-quantity', async (req, res) => {
    try {
        const { quantity } = req.body;
        const food = await Food.findById(req.params.id);
        
        if (!food) {
            return res.status(404).json({ message: 'Food item not found.' });
        }

        if (food.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough quantity available.' });
        }

        const updatedFood = await Food.findByIdAndUpdate(
            req.params.id,
            { $inc: { quantity: -quantity } },
            { new: true }
        );

        res.status(200).json(updatedFood);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update food quantity.', error: error.message });
    }
});

module.exports = router;
