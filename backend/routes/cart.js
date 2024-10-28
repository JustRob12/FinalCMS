const express = require('express');
const Cart = require('../models/carts'); // Import the cart model
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Add food to cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { foodId, name, price, quantity } = req.body;
    const userId = req.user.id; // Extract from token

    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Check if the food item is already in the cart
      const existingItem = cart.foodItems.find((item) => item.foodId.toString() === foodId);
      if (existingItem) {
        existingItem.quantity += quantity; // Increase quantity if it exists
      } else {
        cart.foodItems.push({ foodId, name, price, quantity });
      }
    } else {
      // Create a new cart if none exists
      cart = new Cart({
        userId,
        foodItems: [{ foodId, name, price, quantity }],
      });
    }

    await cart.save();
    res.status(201).json({ message: 'Food added to cart', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add food to cart' });
  }
});


router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the token

    const cart = await Cart.findOne({ userId }).populate('foodItems.foodId');
    if (!cart) {
      return res.status(404).json({ message: 'Cart is empty.' });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to retrieve cart.' });
  }
});

// Remove a specific item from the cart
router.delete('/item/:foodId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { foodId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    cart.foodItems = cart.foodItems.filter((item) => item.foodId.toString() !== foodId);
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ message: 'Failed to remove item from cart.' });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from token

    // Remove the cart for the user
    await Cart.findOneAndDelete({ userId });

    res.status(200).json({ message: 'Cart cleared successfully.' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart.' });
  }
});



// Increment quantity of food item in cart
router.put('/increment/:foodId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from token
    const { foodId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    const item = cart.foodItems.find((item) => item.foodId.toString() === foodId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart.' });

    item.quantity += 1; // Increase quantity
    await cart.save();

    res.status(200).json({ message: 'Item quantity updated.', newQuantity: item.quantity });
  } catch (error) {
    console.error('Error incrementing item:', error);
    res.status(500).json({ message: 'Failed to increment item quantity.' });
  }
});

// Decrement quantity of food item in cart
router.put('/decrement/:foodId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from token
    const { foodId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    const item = cart.foodItems.find((item) => item.foodId.toString() === foodId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart.' });

    if (item.quantity > 1) {
      item.quantity -= 1; // Decrease quantity
    } else {
      // If quantity is 1, you may choose to remove the item or keep it as is
      return res.status(400).json({ message: 'Quantity cannot be less than 1.' });
    }
    
    await cart.save();

    res.status(200).json({ message: 'Item quantity updated.', newQuantity: item.quantity });
  } catch (error) {
    console.error('Error decrementing item:', error);
    res.status(500).json({ message: 'Failed to decrement item quantity.' });
  }
});

module.exports = router;
