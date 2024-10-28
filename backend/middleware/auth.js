const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  console.log("Token received:", token); // Log the token

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // Extract the token
    req.user = decoded; // Attach user data to the request object
    console.log("Decoded user:", req.user); // Log the decoded user info
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Log the error
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
