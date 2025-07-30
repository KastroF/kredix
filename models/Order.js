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
      clientPhone: {type: String}, 
      phone: {type: String}, 
      moneyType: {type: String}, 
      paymentId: {type: String}, 
      date: {type : Date, default: new Date}
})

module.exports = mongoose.model("Order", orderSchema);