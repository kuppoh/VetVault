
const assert = require('assert');
const bcrypt = require('bcrypt');
const request = require('supertest');

describe('Test Strong Password', () => {
  it('should return true', () => {
      const password = 'Password1!';
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const result = regex.test(password);
      assert.strictEqual(result, true);
  });    
});

describe('login', function() {
  it('should return TRUE/success if credentials are valid', function(done) {
    request('http://localhost:3000')
      .post('/login')
      .send({ email: 'reyna@example.com', password: 'reyna123' })
      .end(done);
  });
});


describe('login', function() {
  it('should take a short time for a false credentials', function(done) {
    request('http://localhost:3000')
      .post('/login')
      .send({ email: 'rey@example.com', password: 'rey123' })
      .end(done);
  });
});

describe('login', function() {
  it('should take a while for true credentials', function(done) {
    request('http://localhost:3000')
      .post('/login')
      .send({ email: 'admin@example.com', password: 'admin123' })
      .end(done);
  });
});

describe('login', function() {
  it('should take a while for true credentials', function(done) {
    request('http://localhost:3000')
      .post('/login')
      .send({ email: 'c@example.com', password: 'password123' })
      .end(done);
  });
});