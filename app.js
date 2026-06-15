require('dotenv').config();
const express = require('express');

const companiesRouter = require('./routes/companies');
const jobsRouter = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/companies', companiesRouter);
app.use('/jobs', jobsRouter);

// Health check — useful for production
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler — always last
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});