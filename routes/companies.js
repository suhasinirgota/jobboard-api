const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /companies — get all companies
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM companies');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /companies/:id — get one company
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM companies WHERE id = ?',
            [id] // ← always use ? placeholders, never string concatenation
        );         // this prevents SQL injection

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /companies/:id/jobs — get all jobs for a company
router.get('/:id/jobs', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM jobs WHERE company_id = ? AND active = true',
            [id]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /companies — create a company
router.post('/', async (req, res) => {
    try {
        const { name, industry, location } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO companies (name, industry, location) VALUES (?, ?, ?)',
            [name, industry, location]
        );

        // result.insertId gives you the new row's ID
        res.status(201).json({
            id: result.insertId,
            name,
            industry,
            location
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /companies/:id — update a company
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, industry, location } = req.body;

        const [result] = await pool.query(
            'UPDATE companies SET name = ?, industry = ?, location = ? WHERE id = ?',
            [name, industry, location, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ id: parseInt(id), name, industry, location });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /companies/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM companies WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;