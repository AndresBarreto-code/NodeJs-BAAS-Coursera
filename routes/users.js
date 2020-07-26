var express = require('express');
var userRouter = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('../models/user');
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

userRouter.post('/signup', (req,res,next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if(user != null){
      let err= new Error(`User ${req.body.username} already exists!`);
      err.status = 403;
      next(err);
    }else{
      return User.create({
        username: req.body.username,
        password: req.body.password
      })
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({
      status: 'Registration Successful',
      user: user
    })
  }, (err) => next(err))
  .catch((err) => next(err));
});

userRouter.post('/login', (req,res,next) => {
  if(!req.session.user){
    let authHeader = req.headers.authorization;
    if(!authHeader){
      let err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
    let auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
    let username = auth[0];
    let password = auth[1];
    User.findOne({username: username})
    .then((user) => {
      if(user === null){
        let err = new Error(`User ${username} does not exist!`);
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 403; 
        return next(err);
      }else if(user.password !== password){
        let err = new Error(`Password is incorrect!`);
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 403; 
        return next(err);
      }else if(user.username === username && user.password === password){
        req.session.user = 'authenticated'; 
        res.statusCode = 200;
        res.setHeader('Content-Type','text/plain');
        res.end('You are authenticated!');
      }
    })
    .catch((err) => next(err));;
  }else{
    res.statusCode = 200;
    res.setHeader('Content-Type','text/plain');
    res.end('You are already authenticated!');
  }
});

userRouter.get('/logout',(req,res,next) => {
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }else{
    let err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
});

module.exports = userRouter;
