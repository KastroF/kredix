const Order = require("../models/Order");

exports.addOrder = async (req, res) => {

    try{

        const body = req.body; 
        body.userId = req.auth.userId;

        const newOrder = new Order(body); 

        await newOrder.save(); 

        res.status(201).json({status: 0, message: "Commande utilisée avec succès."})

    }catch(err){

        console.log(err); 
        res.status(505).json({err})
    }
        
}


exports.callback = (req, res) => {

        console.log("Ebilling Callback", req.body);
}