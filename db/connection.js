const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
// Pool = multiple reusable connections
// Much better than creating a new connection for every request
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // max 10 simultaneous connections
});

// Test the connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL connected successfully');
        connection.release(); // always release back to pool
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        process.exit(1); // stop the server if DB fails
    }
};

testConnection();

module.exports = pool;