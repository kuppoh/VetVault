const mysql = require('mysql2'); // Import the mysql2 module
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv'); // Import the dotenv module
dotenv.config(); // Configure dotenv to read the .env file

const sslCertPath = path.join(__dirname, process.env.SSL_CERT_PATH); // Get the SSL certificate path from the .env file

let sslOptions = {};
try { // Try to load the SSL certificate from the path
    sslOptions = {
        ca: fs.readFileSync(sslCertPath)
    };
} catch (error) {
    console.error(`Failed to load SSL certificate from path: ${sslCertPath}`, error);
    process.exit(1);  // Terminate the application if SSL configuration fails
}

const userPool = mysql.createPool({ // Create a connection pool to the MySQL database using the mysql2 module
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: sslOptions
});


const promiseUserPool = userPool.promise(); // Create a promise pool from the connection pool


module.exports = { promiseUserPool }; // Export the promise pool for use in other modules
