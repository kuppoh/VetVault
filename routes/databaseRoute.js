const express = require('express');
const router = express.Router();
const { promiseUserPool } = require('../config/database');
const bcrypt = require('bcrypt');
router.get('/createdb', async (req, res) => {
    try {
        let sql = 'CREATE DATABASE IF NOT EXISTS nodemysql'; // Use IF NOT EXISTS to prevent error if it already exists
        const [result] = await promiseUserPool.query(sql);
        console.log(result);
        res.send('Database created...');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating database');
    }
});

router.get('/createpoststable', async (req, res) => {
    try {
        let sql = 'CREATE TABLE IF NOT EXISTS posts(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY(id))'; // Again, use IF NOT EXISTS
        const [result] = await promiseUserPool.query(sql);
        console.log(result);
        res.send('Posts table created...');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating posts table');
    }
});
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
router.get('/resetdatabase', async (req, res) => { // This will drop the USERS table and recreate it with two generic users, an admin and a user
    try { 
        let sql = 'DROP TABLE IF EXISTS users;';
        const [result] = await promiseUserPool.query(sql);
        console.log(result);

        let newUserTable = 'CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT, name VARCHAR(255), email VARCHAR(255), password VARCHAR(255), role VARCHAR(255), state VARCHAR(255), PRIMARY KEY(id))';
        const [result2] = await promiseUserPool.query(newUserTable);
        console.log(result2);

        let adminPassword = await bcrypt.hash('admin123', 10); // Encrypt the admin password with bcrypt
        let insertAdmin = `INSERT INTO users (name, email, password, role, state) VALUES ('Admin User', 'admin@example.com', '${adminPassword}', 'admin', 'unlocked')`;
        const [result3] = await promiseUserPool.query(insertAdmin);
        console.log(result3);

        let genericPassword = await bcrypt.hash('password123', 10); // Encrypt the generic password with bcrypt
        let insertGeneric = `INSERT INTO users (name, email, password, role, state) VALUES ('Generic User', 'generic@example.com', '${genericPassword}', 'user', 'unlocked')`;
        const [result4] = await promiseUserPool.query(insertGeneric);
        console.log(result4);

        res.send('Database reset with generic users...');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error resetting database');
    }
});

module.exports = router;