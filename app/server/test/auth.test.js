const request = require('supertest')
const expect = require('chai').expect
const app = require('../app')

const User = require('../models/Users')
const message = require('../utils/message')

var api = request(app)

describe('Test REST APIs for Authorization route', function () {
  // reusable variables
  var token;
  const user = {
    name: 'Bob Dylan',
    email: 'bobdylan@gmail.com',
    password: 'abc123'
  }

  // get the token for registered user
  before(function (done) {
    api.post('/api/users')
      .send(user)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body).to.have.property('token');
        expect(res.body.token).to.not.equal(null);
        token = res.body.token;
        done();
      });
  });

  after(async function () {
    // runs after all tests in this block
    await User.deleteMany({}, function (err) {
      if (err) {
        console.error(err.stack);
      } else {
        console.log('Sucessfully cleared User collection!');
      }
    });
  });

  it('GET api/auth -- Get user given the token', function (done) {
    api.get('/api/auth')
      .set('x-auth-token', token)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.email).to.equal(user.email);
        expect(res.body.name).to.equal(user.name);
        done();
      });
  });

  it('GET api/auth -- Sending request without token', function (done) {
    api.get('/api/auth')
      .expect(401)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.message).to.equal(message.EMPTY_TOKEN);
        done();
      });
  });

  it('GET api/auth -- Sending request with invalid token', function (done) {
    api.get('/api/auth')
      .set('x-auth-token', 'invalid token')
      .expect(401)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.message).to.equal(message.INVALID_TOKEN);
        done();
      });
  });

  it('POST api/auth -- sucessfully login by JWT authorization', function (done) {
    const data = {
      email: user.email,
      password: user.password
    }

    api.post('/api/auth')
      .send(data)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.token).to.equal(token);
        done();
      });
  });

  it('POST api/auth -- failed login due to invalid email', function (done) {
    const data = {
      email: 'invalid.email.com',
      password: 'randompassword'
    }
    api.post('/api/auth')
      .send(data)
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.errors[0].msg).to.equal(message.INVALID_EMAIL);
        done();
      });
  });

  it('POST api/auth -- failed login due to missing email', function (done) {
    const data = {
      // email: 'invalid.email.com',
      password: 'randompassword'
    }
    api.post('/api/auth')
      .send(data)
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.errors[0].msg).to.equal(message.INVALID_EMAIL);
        expect(res.body.errors[1].msg).to.equal(message.EMAIL_REQUIRED);
        done();
      });
  });

  it('POST api/auth -- failed login due to missing password', function (done) {
    const data = {
      email: user.email
    }
    api.post('/api/auth')
      .send(data)
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.errors[0].msg).to.equal(message.PASSWORD_REQUIRED);
        done();
      });
  });

  it('POST api/auth -- could not find any user associates with given email', function (done) {
    const data = {
      email: 'non_exist@gmail.com',
      password: 'ramdom'
    }
    api.post('/api/auth')
      .send(data)
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.message).to.equal(message.INVALID_CREDENTIALS);
        done();
      });
  });

  it('POST api/auth -- password do not match', function (done) {
    const data = {
      email: user.email,
      password: 'ramdom'
    }
    api.post('/api/auth')
      .send(data)
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);

        expect(res.body.message).to.equal(message.INVALID_CREDENTIALS);
        done();
      });
  });
});
