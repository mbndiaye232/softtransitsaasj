const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Soft Transit SaaS API is running' });
});

// Import routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/structures', require('./routes/structures'));
app.use('/api/pays', require('./routes/pays'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/statuts', require('./routes/statuts'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/groupes', require('./routes/groupes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dossiers', require('./routes/dossiers'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/produits', require('./routes/produits'));
app.use('/api/regimes', require('./routes/regimes'));
app.use('/api/devises', require('./routes/devises'));
app.use('/api/taxes', require('./routes/taxes'));
app.use('/api/tiers', require('./routes/tiers'));
app.use('/api/cotations', require('./routes/cotations'));
app.use('/api/statistics', require('./routes/statistics'));
// app.use('/api/credits', require('./routes/credits'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
