const mongoose = require("mongoose"); 


const tontineSchema = mongoose.Schema({

        name: {type: String}, 
        headname: {type: String}, 
        created_at: {type: Date, default: Date.now}, 
        description: {type: String},
        active: {type : Boolean}
})

module.exports = mongoose.model("Tontine", tontineSchema);