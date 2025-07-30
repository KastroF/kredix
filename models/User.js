const mongoose = require("mongoose"); 

const userSchema = mongoose.Schema({

        name: {type: String},
        email: {type: String}, 
        password: {type: String}, 
        app: {type: String}, 
        userActive: {type: Boolean, default: true}, 
        appleId: { type: String, unique: true, sparse: true }

})

module.exports = mongoose.model("User", userSchema);