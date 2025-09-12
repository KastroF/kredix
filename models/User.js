const mongoose = require("mongoose"); 

const userSchema = mongoose.Schema({

        name: {type: String},
        email: {type: String}, 
        password: {type: String}, 
        app: {type: String}, 
        userActive: {type: Boolean, default: true}, 
        appleId: { type: String, unique: true, sparse: true }, 
        date: {type: Date, default: Date.now}, 
        amSolde: {type: Number}, 
        mmSolde: {type: Number}, 
        flashSolde: {type: Number}, 
        expressSolde: {type: Number},

})

module.exports = mongoose.model("User", userSchema);