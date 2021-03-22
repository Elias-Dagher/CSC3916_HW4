/*
CSCI HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./serverReq');
var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
var router = express.Router();


function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}
//Signup post method
router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }
            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});
//Signin post method
router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err){
            res.send(err);
        }
        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch){
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else{
                res.status(401).send({success: false, msg: 'Authentication failed.'});

            }
        })
    })
});

//movies get method for getting a movie, saving a movie, updateing a movie, and deleting a movie.
router.route('/movies')
    //getting movies request to get the movies.
    .get(authJwtController.isAuthenticated, function (req, res) {
    //.get(function (req, res) {
        Movie.find({Title: req.body.Title},
            function(err, var1){

                if(err){
                    //if (req.get('Content-Type')) {
                    //res = res.type(req.get('Content-Type'));
                    //}
                    //var o = getJSONObjectForMovieRequirement(req);
                    //res.json(o);
                    res.status(400).json({message: "Request not valid..."});}

                else if(var1.length === 0) {  res.status(400).json({var1: var1, message: "Movie not found, empty list..." });}
                else{
                    //status: 200, message: "GET movies", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY
                    res.json({var1: var1, message: "Movie entered has been found."});
                }});
        })
    //putting movies request to update movies
    .put(authJwtController.isAuthenticated, function(req,res) {
    //.put(function(req,res) {

        if(req.body.Title != null && req.body.Year!= null && req.body.Genre != null  && req.body.Actors != null  && req.body.Actors.length >= 3){

            Movie.findOneAndUpdate({Title:req.body.Title}, {
                Title: req.body.Title, Year: req.body.Year, Genre: req.body.Genre,Actors: req.body.Actors},function(err, cont1){
                if(err){res.json({message: err});}
                else if (cont1 == null){res.json({message:"Cannot find movie..."})}
                else{  res.json({var1: cont1, message:"movie has been updated"})}
                //status: 200, message: "movie updated", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY
            });}

        else { res.status(400).json({message: "empty entry..."}); }
        //if (req.get('Content-Type')) {
        //res = res.type(req.get('Content-Type'));
        //}
        //var o = getJSONObjectForMovieRequirement(req);
        //res.json(o);
    })
    //post movies request to save movies..
    .post(authJwtController.isAuthenticated, function (req, res) {
    //.post(function (req, res) {

        if(req.body.Actors.length < 3){res.status(400).json({message: "not enough entries (3 actors needed)..."});
        }else{Movie.find({Title: req.body.Title},

            function(err, var1){
                if(err){res.status(400).json({message: "something went wrong..."});}
                else if(var1.length === 0) {

                    let mov = new Movie({Title: req.body.Title, Year: req.body.Year, Genre: req.body.Genre, Actors: req.body.Actors});
                    console.log(req.body);

                    mov.save(function(err){
                        if(err) {res.json({message: err});
                            // status: 200, message: "movie saved", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY
                        }else{res.json({message: "movie saved to DB..."});}});
                }
                else {res.status(400).json({ message: "Movie already exists in DB"});}
                //if (req.get('Content-Type')) {
                //res = res.type(req.get('Content-Type'));
                //}
                //var o = getJSONObjectForMovieRequirement(req);
                //res.json(o);
            });
        }
    })

    //delete movies request to delete movies
    .delete(authJwtController.isAuthenticated, function(req,res){
    //.delete(function(req,res){

        Movie.findOneAndDelete({Title: req.body.Title}, function(err, cont1){
            if(err){ res.status(400).json({message:err});}
                //if (req.get('Content-Type')) {
                //res = res.type(req.get('Content-Type'));
                //}
                //var o = getJSONObjectForMovieRequirement(req);
            //res.json(o);
            else if (cont1 == null){res.json({message: "cannot find movie in DB..."});}
            else{res.json({message: "movie deleted from our DB..."});
                //status: 200, message: "movie deleted", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY
            }
        });
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


//router.route('/testcollection')
// .delete(authController.isAuthenticated, function(req, res) {
// console.log(req.body);
//res = res.status(200);
//if (req.get('Content-Type')) {
// res = res.type(req.get('Content-Type'));
// }
// var o = getJSONObjectForMovieRequirement(req);
// res.json(o);
//}
// )
//.put(authJwtController.isAuthenticated, function(req, res) {
//console.log(req.body);
// res = res.status(200);
// if (req.get('Content-Type')) {
//   res = res.type(req.get('Content-Type'));
//  }
// var o = getJSONObjectForMovieRequirement(req);
//  res.json(o);
// }
// );