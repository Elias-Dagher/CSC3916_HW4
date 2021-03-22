var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

var MovCategory = new Schema({
    Title: {type:String, required:true}, Year: {type:Date, required:true}, Genre: {type:String, required:true, enum:["Action", "Comedy", "Drama", "Horror", "Thriller", "Sci-fi"]}, Actors: {type:[{ActorName:String, CharacterName:String}], required:true}});


var Movie = mongoose.model('Movie', MovCategory);
module.exports = Movie;