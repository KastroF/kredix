const DeviceToken = require("../models/DeviceToken");
const Order = require("../models/Order");
const User = require("../models/User"); 

const sendNotification = require("../utils/SendPushNotification"); 

exports.addOrder = async (req, res) => {

    try{

        const body = req.body;
        body.userId = req.auth ? req.auth.userId : req.body.userId;
        
        

        const newOrder = new Order(body); 

        await newOrder.save(); 

        res.status(201).json({status: 0, message: "Commande utilisée avec succès."})

    }catch(err){

        console.log(err); 
        res.status(505).json({err})
    }
        
}

exports.addOrder2 = async (req, res) => {

    try{

      console.log(req.body);

      const body = req.body; 

      const newOrder = new Order(body); 

      await newOrder.save(); 

      res.status(201).json({status: 0, message: "Commande enregistrée avec succès."})


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

           // Recharge revendeur : créditer le solde virtuel avec bonus
           if (order.type === "recharge_flash" || order.type === "recharge_express") {
             const bonusPercent = order.type === "recharge_flash" ? 5 : 6;
             const creditAmount = Math.round(order.amount + (order.amount * bonusPercent / 100));
             const soldeField = order.type === "recharge_flash" ? "flashSolde" : "expressSolde";

             await User.updateOne(
               { _id: order.userId },
               { $inc: { [soldeField]: creditAmount } }
             );
           }

           const tokens = await DeviceToken.find({ userId: order.userId });

           const notifBody = (order.type === "recharge_flash" || order.type === "recharge_express")
             ? `Votre recharge revendeur de ${order.amount} FCFA a été validée. Votre solde a été crédité avec le bonus. Merci.`
             : `Félicitations, votre paiement s'est effectué avec succès, votre transaction vers le ${order.clientPhone} est en cours; Merci.`;

           for (let t of tokens) {
             await sendNotification({
               token: t.token,
               title: "Kredix",
               body: notifBody,
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

        console.log("C'est l'ordre", order);

        const user = await User.findById(req.auth.userId);

        res.status(200).json({status: 0, order, user}); 

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


exports.updateOrder2 = async (req, res) => {



  try {

   
    console.log("on update", req.body); 
    
    const { amount, phone, solde, transId, type } = req.body;

    // Vérifie commandes créées il y a moins de 2 minutes
    const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000);

    const order = await Order.findOne({
      amount: amount,
      clientPhone: phone,
      date: { $gte: fourMinutesAgo }
    });

    if (!order) {
      
      return res.status(404).json({ status: 1, message: "Commande introuvable ou expirée" });
    }

    // Mettre à jour l’order
    order.read = true;
    order.transId = transId;
    await order.save();

    // Mapping type -> champ solde
    const fieldMap = {
      am: "amSolde",
      mm: "mmSolde",
      flash: "flashSolde",
      express: "expressSolde"
    };

    if (fieldMap[type]) {
      await User.updateOne(
        { email: "ouedyservices25@gmail.com" },
        { $set: { [fieldMap[type]]: parseInt(solde) } }
      );
    }

    return res.json({ status: 0, message: "Commande validée et solde utilisateur mis à jour" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 2, message: "Erreur serveur" });
  }

}
exports.checkOrderStatus = async (req, res) => {

  try {

    const { paymentId } = req.params;

    const order = await Order.findOne({ paymentId });

    if (!order) {
      return res.status(404).json({ status: 1, message: "Commande introuvable" });
    }

    res.status(200).json({ status: 0, orderStatus: order.status, isUse: order.isUse });

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 2, message: "Erreur serveur" });
  }
}

exports.addRevendeurOrder = async (req, res) => {

  try {

    const { clientPhone, amount, creditType } = req.body;
    const userId = req.auth.userId;

    if (!clientPhone || !amount || !creditType) {
      return res.status(400).json({ status: 1, message: "Champs manquants" });
    }

    if (!["flash", "express"].includes(creditType)) {
      return res.status(400).json({ status: 1, message: "Type de crédit invalide" });
    }

    const soldeField = creditType === "flash" ? "flashSolde" : "expressSolde";
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 1, message: "Utilisateur introuvable" });
    }

    const currentSolde = user[soldeField] || 0;

    if (currentSolde < parseInt(amount)) {
      return res.status(400).json({ status: 1, message: `Solde ${creditType === "flash" ? "Flash" : "Express"} insuffisant. Solde actuel : ${currentSolde} FCFA` });
    }

    // Décrémenter le solde
    await User.updateOne(
      { _id: userId },
      { $inc: { [soldeField]: -parseInt(amount) } }
    );

    // Créer la commande directement en "success" pour que le téléphone local la traite
    const newOrder = new Order({
      userId,
      amount: parseInt(amount),
      clientPhone,
      type: "credit",
      moneyType: creditType === "flash" ? "AM" : "MOOV",
      status: "success",
      isUse: false,
      date: Date.now()
    });

    await newOrder.save();

    res.status(201).json({ status: 0, message: "Envoi de crédit initié avec succès", solde: currentSolde - parseInt(amount) });

  } catch (err) {

    console.log(err);
    res.status(500).json({ status: 2, message: "Erreur serveur" });
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