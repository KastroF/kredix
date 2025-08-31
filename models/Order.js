const mongoose = require("mongoose"); 

const orderSchema = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // 👈 lien explicite avec le modèle User
        required: true,
      },
      amount: {type: Number}, 
      amount2: {type: Number}, 
      type: {type: String}, 
      status: {type: String, default: "pending"}, 
      isUse: {type: Boolean, default: false},
      clientPhone: {type: String}, 
      phone: {type: String}, 
      moneyType: {type: String}, 
      paymentId: {type: String}, 
      date: {type : Date, default: Date.now}, 
      profile: {type: String}, 
      amPin: {type: String}, 
      moovPin: {type: String}, 
      expessPin: {type: String}, 
      flashPin: {type: String}
})

module.exports = mongoose.model("Order", orderSchema);