const mongoose = require("mongoose"); 


const tontineSchema = mongoose.Schema({

        name: {type: String}, 
        headname: {type: String}, 
        created_at: {type: Date, default: Date.now}, 
        description: {type: String},
        code: {type: String},
        active: {type : Boolean}, 
        userId: {type: String}
})

module.exports = mongoose.model("Tontine", tontineSchema);