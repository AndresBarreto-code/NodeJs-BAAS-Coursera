var express = require('express');
var userRouter = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
let passport = require('passport');
const authenticate = require('../authenticate');

const User = require('../models/user');
userRouter.use(bodyParser.json());

/* GET users listing. */
userRouter.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

userRouter.post('/signup', (req,res,next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err){
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json({err: err});
    }else{
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({
          success: true,
          status: 'Registration Successful'
        });
      });
    }
  });
});

userRouter.post('/login', passport.authenticate('local'), (req,res) => {
  let token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  res.json({
    success: true,
    token: token,
    status: 'You are successfully logged in!'
  });  
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
