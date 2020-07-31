const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOneAndUpdate({user: req.user._id},{$push: {dishes: req.body}},{upsert: true, new: true})
    .then((favorite) => {
        let unique = new Set();
        favorite.dishes.forEach((dish) => {
            if(!unique.has(dish)) unique.add(dish);
        });
        favorite.dishes = [...unique];
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(favorite);          
        });          
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on ${req.baseUrl}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req,res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on ${req.baseUrl}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOneAndUpdate({user: req.user._id},{$push: {dishes: req.params.dishId}},{upsert: true, new: true})
    .then((favorite) => {
        let unique = new Set();
        favorite.dishes.forEach((dish) => {
            if(!unique.has(dish)) unique.add(dish);
        });
        favorite.dishes = [...unique];
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(favorite);          
        });
    }, (err) => next(err))
    .catch((err) => next(err));    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on ${req.baseUrl}`)
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        let indexOfDish = favorite.dishes.indexOf(req.params.dishId);
        favorite.dishes.splice(indexOfDish,1);
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(favorite);            
        });
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;