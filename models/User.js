import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    preferences: {
        location: { type: String },
        budgetMin: { type: Number },
        budgetMax: { type: Number },
        bedrooms: { type: Number }
    },
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }], // Viewed properties
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }] // Liked properties
});

export default mongoose.model('User', userSchema);
