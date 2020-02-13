const request = require('supertest');
const expect = require('chai').expect;
const app = require('../app');

const User = require('../models/Users');

describe('Test REST APIs for User route', function () {
    before(function() {
    // runs before all tests in this block
    });

    after(async function() {
    // runs after all tests in this block
        await User.deleteMany({}, function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log('Sucessfully cleared User collection!');
            }
        });
    });

    const user = {
            "name": "David Beckham",
            "email": "helloworld@gmail.com",
            "password": "abc123"
    };
    // beforeEach(function() {
    // // runs before each test in this block
    //     user = {
    //         "name": "David Beckham",
    //         "email": "helloworld@gmail.com",
    //         "password": "abc123"
    //     };
    // });

    afterEach(function() {
    // runs after each test in this block
    });

    it('POST api/users -- register new user', function (done) {
        request(app).post('/api/users')
        .send(user)
        .expect(200)
        .end(function(err, res) {
            expect(res.body).to.have.property('token');
            expect(res.body.token).to.not.equal(null);
            done();
        });
    });
});