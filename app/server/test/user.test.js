const request = require('supertest');
const expect = require('chai').expect;
const app = require('../app');

const User = require('../models/Users');
const message = require('../utils/message');

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

    it('POST api/users -- register new user succesfully', function (done) {
        const user = {
            name: "Bob Dylan",
            email: "bobdylan@gmail.com",
            password: "abc123"
        };
        request(app).post('/api/users')
        .send(user)
        .end(async function(err, res) {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
            expect(res.body.token).to.not.equal(null);
            // verify if the user has been created in database
            await User.findOne( {email: user.email }, function(err, lookupUser){
                expect(lookupUser).to.not.equal(null);
                done();
            });
        });
    });

    it('POST api/users -- register new user failed due to invalid email', function (done) {
        const user = {
            name: "Bob Dylan",
            email: "bobdylan.gmail.com",
            password: "abc123"
        };
        request(app).post('/api/users')
        .send(user)
        .end(async function(err, res) {
            expect(res.status).to.equal(400);
            // expect(res.body.token).to.not.equal(null);
            // verify if the user doesn't exist in database
            await User.findOne( {email: user.email }, function(err, lookupUser){
                expect(lookupUser).to.equal(null);
                done();
            });
        });
    });

    it('POST api/users -- register new user failed due to weak password (password contains less than 6 characters)', function (done) {
        const user = {
            name: "John Lenon",
            email: "johnlenon@gmail.com",
            password: "short"
        };
        request(app).post('/api/users')
        .send(user)
        .end(async function(err, res) {
            expect(res.status).to.equal(400);
            expect(res.body.errors[0].msg).to.be.equal(message.PASSWORD_TOO_SHORT);
            // console.log(res);
            // expect(res.body.token).to.not.equal(null);
            // verify if the user doesn't exist in database
            await User.findOne( {email: user.email }, function(err, lookupUser){
                expect(lookupUser).to.equal(null);
                done();
            });
        });
    });

    it('POST api/users -- register new user failed due to existing email)', function (done) {
        const user = {
            name: "Iron Man",
            email: "ironman@marvel.com",
            password: "StrongPassword"
        };

        request(app).post('/api/users')
        .send(user)
        .end(async function(err, res) {
            expect(res.status).to.equal(200);
            expect(res.body.token).to.not.equal(null);
            // console.log(res);
            // expect(res.body.token).to.not.equal(null);
            // verify if the user doesn't exist in database
            await User.findOne( {email: user.email }, function(err, lookupUser){
                expect(lookupUser).to.not.equal(null);
            });

            const newUser = {
                name: "Captain America",
                email: "ironman@marvel.com",
                password: "VeryStrongPassword"
            };
            
            request(app).post('/api/users')
            .send(newUser)
            .end(function(err, res) {
                expect(res.status).to.be.equal(400);
                expect(res.body.errors[0].message).to.be.equal(message.EMAIL_EXIST);
                done();
            });
        });
    });

});