let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let User= require('./models/user');
let JwtStrategy = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;
let jwt = require('jsonwebtoken');
let FacebookTokenStrategy = require('passport-facebook-token');
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

let config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log(`JWT payload`, jwt_payload);
    User.findOne({_id:jwt_payload._id}, (err, user) => {
        if(err) return done(err, false);
        else if (user) return done(null, user);
        else return done(null, false);
    });
}));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin) return next();
    let err = new Error('You are not authorized to perform this operation!');
    err.statusCode = 403;
    return next(err);
}

exports.verifyOwner = (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish != null && dish.comments.id(req.params.commentId) != null){
            if(req.user._id.equals(dish.comments.id(req.params.commentId).author._id)){
                return next();
            }else{
                let err = new Error('You are not authorized to perform this operation!');
                err.statusCode = 403;
                return next(err);
            }
        }else if(dish == null){
            let err = new Error(`Dish ${req.params.dishId} does not found`);
            err.statusCode = 404;
            return next(err);
        }else{
            let err = new Error(`Comment ${req.params.commentId} does not found`);
            err.statusCode = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
};

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy({
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accesToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if(err) return done(err, false);
                if(!err && user !== null) return done(null, user); 
                else {
                    user = new User({username: profile.displayName});
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if(err) return done(err, null);
                        else return done(null, user);
                    });
                };
            })
        }
    )
);