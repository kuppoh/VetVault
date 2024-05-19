const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });
const { isAdmin } = require('../middleware/checkAuth');
const assert = require('assert');
const bcrypt = require('bcrypt');
const request = require('supertest');
const { promiseUserPool } = require('../config/database');

describe('login', function() {
  it('should return success if credentials are valid', function(done) {
    request('http://localhost:3000')
      .post('/login')
      .send({ email: 'reyna@example.com', password: 'reyna123' })
      .expect(302) // expecting HTTP status code 200
      .end(function(err, res) {
        if (err) return done(err);
        assert.strictEqual(res.headers.location, '/dashboard');
        done();
      });
  });

  it('should return error if credentials are invalid', function(done) {
    request('http://localhost:3000')
      .post('/login')
      .send({ email: 'rey@example.com', password: 'rey123' })
      .end(function(err, res) {
        if (err) return done(err);
        assert.strictEqual(res.headers.location, '/login');
        done();
      });
  });
});

describe('register new user', function() {
it('should create a new user in the database', async function() {
  this.timeout(5000);
  const newUser = {
    name: 'star',
    email: 'star@example.com',
    password: 'star123',
    phone_number: '1234567890',
  };

  await request('http://localhost:3000')
    .post('/register')
    .send(newUser)
    .expect(302);


  const [rows] = await promiseUserPool.query('SELECT users.email FROM users WHERE email = ?', newUser.email);

  assert(rows.length > 0, 'User should exist in the database');
});
})

describe('logout', function() {
  it('should return success if user is logged out', function(done) {
    request('http://localhost:3000')
      .post('/login')
      .send({ email: 'bob@example.com', password: 'bob123' })
      .expect(302) 
      .end(function(err, res) {
        if (err) return done(err);
        assert.strictEqual(res.headers.location, '/dashboard');
        request('http://localhost:3000')
          .post('/logout')
          .expect(302)
          .end(function(err, res) {
            if (err) return done(err);
            assert.strictEqual(res.headers.location, '/login');
            done();
          });
      });
  });
});


describe('Test Hashed Password Comparisons', () => {
    it('should return true', async () => {
        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await bcrypt.compare(password, hashedPassword);
        assert.strictEqual(result, true);
    });
});


describe('Test Weak Password', () => {
    it('should return false', () => {
        const password = 'password';
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const result = regex.test(password);
        assert.strictEqual(result, false);
    })
  });

            

describe('Test Strong Password', () => {
    it('should return true', () => {
        const password = 'Password1!';
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const result = regex.test(password);
        assert.strictEqual(result, true);
    });    
});



describe('Test Database Connection', () => {
    it('should return true', async () => {
        const [rows, fields] = await promiseUserPool.query('SELECT 1 + 1 AS solution');
        assert.strictEqual(rows[0].solution, 2);
    });
});

describe('Test Database Data Users', () => {
    it('should return true', async () => {
        const [rows, fields] = await promiseUserPool.query('SELECT * FROM users');
        assert.strictEqual(rows.length > 0, true);
    });
});

describe('Test Database Data PET', () => {
  it('should return true', async () => {
      const [rows, fields] = await promiseUserPool.query('SELECT * FROM PET');
      assert.strictEqual(rows.length > 0, true);
  });
});

const { forwardAuthenticated } = require('../middleware/checkAuth');

describe('Test forwardAuthenticated Middleware', () => {
    it('should return true', () => {
        const req = { isAuthenticated: () => false };
        const res = { redirect: (url) => url };
        const next = () => true;
        const result = forwardAuthenticated(req, res, next);
        assert.strictEqual(result, true);
    });
});

describe('Test if Email exists', () => {
    it('should return true', async () => {
        const email = "bob@example.com";
        const [rows] = await promiseUserPool.query('SELECT email FROM users WHERE email = ?', email);
        assert.strictEqual(rows.length > 0, true);
    });
});

describe('Check if a user is an admin', () => {
    it('should return true', async () => {
        const userId = 1;
        const query = "SELECT role FROM users WHERE id = ?";
        const [results] = await promiseUserPool.query(query, [userId]);
        assert.strictEqual(results[0].role, 'admin');
    });
});

describe('Test isAdmin middleware', () => {
    it('should return true', async () => {
        const req = { user: { id: 1 } };
        const res = { status: (code) => code, send: (message) => message };
        const next = () => true;
        const result = await isAdmin(req, res, next);
        assert.strictEqual(result, true);
    });
});