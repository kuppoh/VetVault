const { promiseUserPool } = require('../config/database');
const bcrypt = require('bcrypt');


// MySQL connection

const getUserByEmailIdAndPassword = async (email, password) => { // Get user by email, id, and password
  const [rows] = await promiseUserPool.query('SELECT * FROM users WHERE email = ?', [email]); // Select all users from the users table where the email matches the email parameter
  if (rows.length > 0) {
    const user = rows[0];
    const hash = user.password; // Get the password hash from the user
    const result = await bcrypt.compare(password, hash); // Compare the password with the hashed password from the database
    if (result) { // If the password matches the hashed password
      return user; // Return the user
    }
  } // If the password does not match the hashed password or the email does not exist
  return null; // Return null
};

const getUserById = async (id) => {
  const [rows] = await promiseUserPool.query('SELECT * FROM users WHERE id = ?', [id]);
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
};

module.exports = {
  getUserByEmailIdAndPassword,
  getUserById,
};
