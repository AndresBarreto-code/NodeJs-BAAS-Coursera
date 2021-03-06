var express = require('express');
var userRouter = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
let passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const User = require('../models/user');
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});

userRouter.post('/signup', cors.corsWithOptions, (req,res,next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err){
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json({err: err});
    }else{
      if(req.body.firstname) user.firstname = req.body.firstname;
      if(req.body.lastname) user.lastname = req.body.lastname;
      user.save((err, user) => {
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type','application/json');
          res.json({err: err});
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type','application/json');
          res.json({
            success: true,
            status: 'Registration Successful'
          });
        });
      });
    }
  });
});

userRouter.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req,res) => {
  let token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  res.json({
    success: true,
    token: token,
    status: 'You are successfully logged in!'
  });  
});

userRouter.get('/logout', cors.cors, (req,res,next) => {
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

userRouter.get('/facebook/token', cors.corsWithOptions, passport.authenticate('facebook-token'), (req,res) => {
  if(req.user){
    let token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({
      success: true,
      token: token,
      status: 'You are successfully logged in!'
    });  
  }else{
    res.statusCode = 403;
    res.setHeader('Content-Type','application/json');
    res.json({
      success: false,
      status: 'You are denied'
    });  
  }
});

module.exports = userRouter;
