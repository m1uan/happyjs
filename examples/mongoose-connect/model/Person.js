// create an export function to encapsulate the model creation
module.exports = function($mongoose) {
    // define schema
    var PersonSchema = new $mongoose.Schema({
        name : String,
        age : Number,
        birthday : Date,
        gender: String,
        likes: [String]
    });
    return $mongoose.model('Person', PersonSchema);
};