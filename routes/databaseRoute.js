const express = require('express');
const router = express.Router();
const { promiseUserPool } = require('../config/database');
const bcrypt = require('bcrypt');
const databaseController = require('../controller/database_controller');

router.get('/users', async (req, res) => {
    try {
        const [rows] = await promiseUserPool.query('SELECT * FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error getting users');
    }
});


// This is to hard reset the database for testing purposes, DO NOT use in production
router.get('/resetdatabase', async (req, res) => { 
    try { // SQL query to remove users with ID > 6
        let sql = 'DELETE FROM users WHERE id > 6';
        let [result] = await promiseUserPool.query(sql);
        console.log(result);

        res.send('Database reset with generic users...');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error resetting database');
    }
});

module.exports = router;