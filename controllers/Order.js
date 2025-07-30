const DeviceToken = require("../models/DeviceToken");
const Order = require("../models/Order");
const sendNotification = require("../utils/SendPushNotification"); 

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


exports.callback = async (req, res) => {

        console.log("Ebilling Callback", req.body);

        try{

           await Order.updateOne({paymentId: req.body.paymentId}, {$set: {status: "success"}}); 

           const order = await Order.findOne({paymentId: req.body.paymentId}); 

           const tokens = await DeviceToken.find({ userId: order.userId });


           for (let t of tokens) {
             await sendNotification({
               token: t.token,
               title: "Kredix",
               body: `Félicitations, votre paiement s'est effectué avec succès, votre transaction vers le ${order.clientPhone} est en cours; Merci.`,
               badge: 1,
               data: {},
             });
           }

           res.status(200).json({status: 0, message: "Thanks"})


        }catch(err){

            console.log(err); 
            res.status(505).json({err})
        }
}