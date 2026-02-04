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
const authRoutes = require('./routes/auth');
const structuresRoutes = require('./routes/structures');
const paysRoutes = require('./routes/pays');
const clientsRoutes = require('./routes/clients');
const statutsRoutes = require('./routes/statuts');
const transactionsRoutes = require('./routes/transactions');
const groupesRoutes = require('./routes/groupes');
const usersRoutes = require('./routes/users');
const dossiersRoutes = require('./routes/dossiers');
const notesRoutes = require('./routes/notes');
const produitsRoutes = require('./routes/produits');
const regimesRoutes = require('./routes/regimes');
const devisesRoutes = require('./routes/devises');
const taxesRoutes = require('./routes/taxes');
const tiersRoutes = require('./routes/tiers');
const cotationsRoutes = require('./routes/cotations');
const statisticsRoutes = require('./routes/statistics');
const activitesRoutes = require('./routes/activites');
const incotermsRoutes = require('./routes/incoterms');
const regimesOTRoutes = require('./routes/regimesOT');
const typesDocumentsOTRoutes = require('./routes/typesDocumentsOT');
const ordresTransitRoutes = require('./routes/ordresTransit');

app.use('/api/auth', authRoutes);
app.use('/api/structures', structuresRoutes);
app.use('/api/pays', paysRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/statuts', statutsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/groupes', groupesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dossiers', dossiersRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/regimes', regimesRoutes);
app.use('/api/devises', devisesRoutes);
app.use('/api/taxes', taxesRoutes);
app.use('/api/tiers', tiersRoutes);
app.use('/api/cotations', cotationsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/activites', activitesRoutes);
app.use('/api/incoterms', incotermsRoutes);
app.use('/api/regimes-ot', regimesOTRoutes);
app.use('/api/types-documents-ot', typesDocumentsOTRoutes);
app.use('/api/ordres-transit', ordresTransitRoutes);
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
