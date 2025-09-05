const DeviceToken = require("../models/DeviceToken");
const Order = require("../models/Order");
const sendNotification = require("../utils/SendPushNotification"); 

exports.addOrder = async (req, res) => {

    try{

        const body = req.body; 
        body.userId = req.auth ? req.auth.userId : req.body.userId;
        
        if(req.body.value){

          body.value = req.body.value; 
          body.clientPhone = "074093850";
          body.selected = req.body.selected

        }

        if(req.body.netflixMail){

          body.netflixMail = req.body.netflixMail; 
        }

        if(req.body.netflixPass){

          body.netflixPass = req.body.netflixPass;
        }

        body.joinPhone = req.body.value === "Netlix" ? req.body.joinPhone : req.body.phone;
        
        

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

exports.getPendingOrder = async (req, res) => {

      try{

        const order = await Order.find({status: "success", isUse: false}).sort({date: 1}).limit(1); 

        res.status(200).json({status: 0, order}); 

      }catch(err){

            console.log(err); 
            res.status(505).json({err})
        }
}

exports.updateOrder = async (req, res) => {

    try{

      await Order.updateOne({_id: req.body._id}, {$set: {isUse: true}});

      res.status(200).json({status: 0}); 

    }catch(err){

            console.log(err); 
            res.status(505).json({err})
      }

}

exports.getOrders = async (req, res) => {

    const startAt =  Number(req.body?.startAt ?? 0); 

    try{

      const orders = await Order.find({userId: req.auth.userId, status: "success"}).sort({date: -1}).skip(startAt).limit(10); 

      res.status(200).json({orders, startAt: orders.length === 10 ? parseInt(startAt) + 10 : null})


    }catch(err){

            console.log(err); 
            res.status(505).json({err})
      }
}