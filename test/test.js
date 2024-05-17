const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const assert = require('assert');
const bcrypt = require('bcrypt');
const request = require('supertest');
const { promiseUserPool } = require('../config/database');

describe('Test Strong Password', () => {
  it('should return true', () => {
      const password = 'Password1!';
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const result = regex.test(password);
      assert.strictEqual(result, true);
  });    
});

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
    name: 'bingo',
    email: 'bingo@example.com',
    password: 'bingo123',
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



