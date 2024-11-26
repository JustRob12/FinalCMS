const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    gsisId: { 
        type: String, 
        required: function() { 
            return this.role === 'faculty';  // Only required for faculty
        },
        default: null  // Add default value
    },
    course: { type: String, required: true },
    year: { type: Number, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'faculty'], required: true },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
