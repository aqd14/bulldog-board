const request = require('supertest')
const expect = require('chai').expect
const app = require('../app')

const User = require('../models/Users')
const message = require('../utils/message')

var api = request(app)

describe('Test REST APIs for Authorization route', function () {
  after(async function () {
    // runs after all tests in this block
    await User.deleteMany({}, function (err) {
      if (err) {
        console.error(err.stack)
      } else {
        console.log('Sucessfully cleared User collection!')
      }
    })
  })

  it('GET api/auth -- Get user given the token', function (done) {
    const user = {
      name: 'Bob Dylan',
      email: 'bobdylan@gmail.com',
      password: 'abc123'
    }

    api.post('/api/users')
      .send(user)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).to.have.property('token')
        expect(res.body.token).to.not.equal(null)

        api.get('/api/auth')
          .set('x-auth-token', res.body.token)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)

            expect(res.body.email).to.equal(user.email)
            expect(res.body.name).to.equal(user.name)
            done()
          })
      })
  })

  it('GET api/auth -- Sending request without token', function (done) {
    api.get('/api/auth')
      .expect(401)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body.message).to.equal(message.EMPTY_TOKEN)
        done()
      })
  })

  it('GET api/auth -- Sending request with invalid token', function (done) {
    api.get('/api/auth')
      .set('x-auth-token', 'invalid token')
      .expect(401)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body.message).to.equal(message.INVALID_TOKEN)
        done()
      })
  })
})
