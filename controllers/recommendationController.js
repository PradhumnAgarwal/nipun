import User from '../models/User.js';
import Property from '../models/property.js';
import cosineSimilarity from 'cosine-similarity';

// Helper: Convert tags into vectors
const getFeatureVector = (tags, allTags) => {
    return allTags.map(tag => (tags.includes(tag) ? 1 : 0));
};

export const getRecommendations = async (req, res) => {
    const userId = req.query.userId;

    try {
        // Fetch user data
        const user = await User.findById(userId).populate('history').populate('favorites');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch all properties
        const properties = await Property.find();

        // Combine user's history and favorites as the "basis" for recommendations
        const viewedAndLiked = [...user.history, ...user.favorites];

        if (viewedAndLiked.length === 0) {
            return res.status(200).json({ message: 'No recommendations available. Please view or like some properties first.' });
        }

        // Create a list of all unique tags
        const allTags = [...new Set(properties.flatMap(p => p.tags))];

        // Calculate average feature vector from history and favorites
        const userVector = viewedAndLiked.reduce((acc, property) => {
            const vector = getFeatureVector(property.tags, allTags);
            return acc.map((val, idx) => val + vector[idx]);
        }, Array(allTags.length).fill(0)).map(val => val / viewedAndLiked.length);

        // Filter properties based on user's preferences
        const filteredProperties = properties.filter(property => {
            return (
                (!user.preferences.location || property.location === user.preferences.location) &&
                (!user.preferences.budgetMin || property.price >= user.preferences.budgetMin) &&
                (!user.preferences.budgetMax || property.price <= user.preferences.budgetMax) &&
                (!user.preferences.bedrooms || property.bedrooms === user.preferences.bedrooms)
            );
        });

        // Calculate similarity scores
        const recommendations = filteredProperties
            .map(property => {
                const propertyVector = getFeatureVector(property.tags, allTags);
                return {
                    property,
                    similarity: cosineSimilarity(userVector, propertyVector)
                };
            })
            .sort((a, b) => b.similarity - a.similarity); // Sort by similarity score

        // Return recommended properties
        res.json(recommendations.map(r => r.property));
    } catch (err) {
        res.status(500).json({ message: 'Error generating recommendations', error: err.message });
    }
};
