import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import recommendationRoutes  from './routes/recommendationRoutes.js';

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'public')));


// Define routes
// Homepage
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to Property App' });
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Property Listing Page

app.get('/properties', async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/properties`); // Replace with actual API URL
        const properties = await response.json(); // Parse JSON response
        res.render('properties', { properties });
    } catch (err) {
        res.status(500).send('Error loading properties');
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Catch-all route for undefined pages
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
