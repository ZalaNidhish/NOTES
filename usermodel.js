const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/user')

const userSchema = mongoose.Schema({
    username: String,
    pass:String,
})

module.exports = mongoose.model('user', userSchema);
