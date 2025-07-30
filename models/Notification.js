const mongoose = require("mongoose"); 

const notifSchema = mongoose.Schema({

        title: String, 
        text: String, 
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // 👈 lien explicite avec le modèle User
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          }, 
          view: {
            type: Boolean, 
            default: false
          }, 
          read: {
            type: Boolean, 
            default: false
          }

})

module.exports = mongoose.model("Notification", notifSchema)