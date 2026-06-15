const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /jobs — get all jobs, with optional filters
router.get('/', async (req, res) => {
    try {
        const { type, active } = req.query;

        let query = `
            SELECT jobs.*, companies.name AS company_name, companies.location
            FROM jobs
            JOIN companies ON jobs.company_id = companies.id
            WHERE 1=1
        `;
        const params = [];

        // Dynamically add filters if provided
        if (type) {
            query += ' AND jobs.type = ?';
            params.push(type);
        }

        if (active !== undefined) {
            query += ' AND jobs.active = ?';
            params.push(active === 'true');
        }

        query += ' ORDER BY jobs.created_at DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /jobs/:id — get one job with company info
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT jobs.*, companies.name AS company_name,
                    companies.industry, companies.location
             FROM jobs
             JOIN companies ON jobs.company_id = companies.id
             WHERE jobs.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /jobs — create a job listing
router.post('/', async (req, res) => {
    try {
        const { company_id, title, description, salary, type } = req.body;

        if (!company_id || !title) {
            return res.status(400).json({
                message: 'company_id and title are required'
            });
        }

        // Check company exists
        const [company] = await pool.query(
            'SELECT id FROM companies WHERE id = ?',
            [company_id]
        );

        if (company.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const [result] = await pool.query(
            `INSERT INTO jobs (company_id, title, description, salary, type)
             VALUES (?, ?, ?, ?, ?)`,
            [company_id, title, description, salary, type || 'full-time']
        );

        res.status(201).json({
            id: result.insertId,
            company_id,
            title,
            description,
            salary,
            type: type || 'full-time',
            active: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /jobs/:id — update job
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, salary, type, active } = req.body;

        const [result] = await pool.query(
            `UPDATE jobs
             SET title = ?, description = ?, salary = ?, type = ?, active = ?
             WHERE id = ?`,
            [title, description, salary, type, active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ id: parseInt(id), title, description, salary, type, active });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /jobs/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM jobs WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;