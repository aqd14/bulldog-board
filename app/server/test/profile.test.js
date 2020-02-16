const request = require('supertest')
const expect = require('chai').expect;
const app = require('../app')

const message = require('../utils/message');
const User = require('../models/Users');
const Profile = require('../models/Profiles');

api = request(app);

describe('Test REST APIs for Profile', function () {
  // reusable variable
  const user = {
    name: 'Bob Dylan',
    email: 'bobdylan@gmail.com',
    password: 'abc123'
  }

  const profile = {
    title: 'Professional Web Developer',
    status: 'Day Dreamer',
    skills: 'Free kick, Corner',
    bio: 'You only live once',
    github: 'fakeuser',
    youtube: 'https://youtube.com/bobdylan',
    facebook: 'https://facebook.com/bobdylan',
    instagram: 'https://instagram.com/bobdylan'
  }

  var token;

  // initialize user and profile
  before(function (done) {
    api.post('/api/users')
      .send(user)
      .expect(200)
      .end(function (err, res) {
        if (err) done(err);

        token = res.body.token;
        done();
      })
  })

  after(function () {
    // runs after all tests in this block
    Profile.deleteMany({}, function (err) {
      if (err) console.error(err.stack);
      else console.log('Succesfully cleared Profile collection.');
    });

    User.deleteMany({}, function (err) {
      if (err) console.error(err.stack);
      else console.log('Succesfully cleared User collection.');
    });
  })

  beforeEach(function () {
    // runs before each test in this block
  })

  afterEach(function () {
    
  })

  // if user is not logged in, the server should response with status code 401
  it('GET api/profiles/me -- Get current user\'s profile without logging in', function (done) {
    api.get('/api/profiles/me')
      .expect(401)
      .end(function (err, res) {
        if (err) done(err);

        expect(res.body.message).to.equal(message.EMPTY_TOKEN);
        done();
      });
  })

  it('GET api/profiles/me -- Logged in user without profile', function (done) {
    api.get('/api/profiles/me')
      .set('x-auth-token', token)
      .expect(400)
      .end(function (err, res) {
        if (err) done(err);

        expect(res.body.message).to.equal(message.NO_PROFILE);
        // expect(res.body).to.equal(message.EMPTY_TOKEN);
        done();
      });
  })

  it('POST api/profiles -- Create new profile for logged in user', function (done) {
    api.post('/api/profiles')
      .set('x-auth-token', token)
      .send(profile)
      .expect(200)
      .end(function (err, res) {
        if (err) done(err);
        expect(res.body).to.not.equal(null);
        expect(res.body.title).to.equal(profile.title);
        expect(res.body.status).to.equal(profile.status);
        done();
      });
  })

  it('GET api/profiles -- Get user\'s profile', function (done) {
    api.get('/api/profiles')
      .set('x-auth-token', token)
      .expect(200)
      .end(function (err, res) {
        if (err) done(err);
        expect(res.body).to.not.equal(null);
        console.log(res.body);
        expect(res.body.title).to.equal(profile.title);
        expect(res.body.status).to.equal(profile.status);
        expect(res.body.user.name).to.equal(user.name);
        expect(res.body.user.email).to.equal(user.email);
        done();
      });
  })
})
