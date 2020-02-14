const request = require('supertest')
const app = require('../app')

describe('Test REST APIs for User route', function () {
  before(function () {
    // runs before all tests in this block
  })

  after(function () {
    // runs after all tests in this block
  })

  beforeEach(function () {
    // runs before each test in this block
  })

  afterEach(function () {
    // runs after each test in this block
  })

  it('Get all profiles', function (done) {
    request(app).get('/')
      .expect(200)
      .expect('API Running!', done)
  })
})
