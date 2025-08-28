const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
require('dotenv').config();
const sendNotification = require("../utils/SendPushNotification"); 
const DeviceToken = require('../models/DeviceToken');


// -------- SIGNUP --------
exports.signup = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, mode, appleId } = req.body;

    if (!email && !appleId)
      return res.status(400).json({ status: 1, message: "Email ou identifiant Apple requis." });

    // 1. Cas Apple
    if (mode === "apple") {
      let user = await User.findOne({ $or: [{ email }, { appleId }] });

      // Si utilisateur existant sans appleId mais avec email
      if (user && !user.appleId && appleId) {
        await User.updateOne({ _id: user._id }, { $set: { appleId, userActive: true } });
      }

      // Si utilisateur existant mais inactif
      if (user && user.userActive === false) {
        await User.updateOne({ _id: user._id }, { $set: { userActive: true } });
      }

      // Créer le compte si inexistant
      if (!user) {
        if (!email || !name || !appleId)
          return res.status(400).json({ status: 1, message: "Champs requis manquants pour Apple Sign-In." });

        user = await User.create({ name, email, appleId, userActive: true });
      }

      const token = jwt.sign({ userId: user._id }, process.env.CODETOKEN);
      return res.status(200).json({ status: 0, token, user });
    }

    // 2. Cas Google
    if (mode === "google") {
      let user = await User.findOne({ email });

      if (user) {
        if (user.userActive === false) {
          await User.updateOne({ _id: user._id }, { $set: { userActive: true } });
        } else {
          return res.status(200).json({ status: 3, message: "Email déjà utilisé" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.CODETOKEN);
        return res.status(200).json({ status: 0, token, user });
      }

      if (!email || !name)
        return res.status(400).json({ status: 1, message: "Champs requis manquants pour Google Sign-In." });

      user = await User.create({ name, email, userActive: true });
      const token = jwt.sign({ userId: user._id }, process.env.CODETOKEN);

      return res.status(201).json({ status: 0, token, user });
    }

    // 3. Cas classique
    if (!name || !email || !password)
      return res.status(400).json({ status: 1, message: "Champs requis manquants." });

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.userActive === false) {
        await User.updateOne({ _id: existingUser._id }, { $set: { userActive: true } });

        const token = jwt.sign({ userId: existingUser._id }, process.env.CODETOKEN);
        return res.status(200).json({ status: 0, token, user: existingUser });
      }

      return res.status(200).json({ status: 3, message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, userActive: true });

    const token = jwt.sign({ userId: user._id }, process.env.CODETOKEN);

    return res.status(201).json({ status: 0, token, user });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 99, message: "Erreur serveur." });
  }
};


exports.onEnvoi = async (req, res) => {
  try {
    const tokens = await DeviceToken.find({ userId: "687bf59dc38b1780950c2086" });

    for (let t of tokens) {
      await sendNotification({
        token: t.token,
        title: "Rois Mages",
        body: "Bienvenue sur cette belle plateforme",
        badge: 2,
        data: { screen: "Dashboard" },
      });
    }

    return res.status(200).json({ status: 0, message: "Notifications envoyées." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 99, message: "Erreur lors de l'envoi", err });
  }
};


// -------- SIGNIN --------
exports.signin = async (req, res) => {
  console.log(req.body);

  try {
    const { email, password, mode, name, appleId } = req.body;

    if (!email && !appleId) {
      return res.status(400).json({ status: 1, message: "Email ou identifiant Apple requis." });
    }

    // 1. Si mode = "apple"
    if (mode === "apple") {
      let user = await User.findOne({ $or: [{ email }, { appleId }] });

      // Si utilisateur existe mais pas encore de appleId -> on met à jour
      if (user && !user.appleId && appleId) {
        await User.updateOne({ _id: user._id }, { $set: { appleId, userActive: true } });
        user.userActive = true;
      }

      // S'il n'existe pas -> on le crée actif
      if (!user) {
        if (!email || !name || !appleId) {
          return res.status(400).json({ status: 1, message: "Champs requis manquants pour Apple Sign-In." });
        }
        user = await User.create({ name, email, appleId, userActive: true });
      }

      // Si user existe mais inactif -> on l'active
      if (!user.userActive) {
        await User.updateOne({ _id: user._id }, { $set: { userActive: true } });
        user.userActive = true;
      }

      const token = jwt.sign({ userId: user._id }, process.env.CODETOKEN);
      return res.status(200).json({ status: 0, token, user });
    }

    // 2. Si mode = "google"
    if (mode === "google") {
      let user = await User.findOne({ email });
      if (!user) return res.status(200).json({ status: 2, message: "Utilisateur introuvable." });

      // Si user inactif -> on active
      if (!user.userActive) {
        await User.updateOne({ _id: user._id }, { $set: { userActive: true } });
        user.userActive = true;
      }

      const token = jwt.sign({ userId: user._id }, process.env.CODETOKEN);
      return res.status(200).json({ status: 0, token, user });
    }

    // 3. Connexion classique (email/password)
    if (!email || !password) {
      return res.status(400).json({ status: 1, message: "Email et mot de passe requis." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ status: 2, message: "Utilisateur introuvable." });

    // 🔑 Vérifie si userActive est false -> refuser
    if (!user.userActive) {
      return res.status(403).json({ status: 4, message: "Utilisateur inactif, veuillez utiliser Google ou Apple pour activer votre compte." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(200).json({ status: 3, message: "Mot de passe incorrect." });

    const token = jwt.sign({ userId: user._id }, process.env.CODETOKEN);
    return res.status(200).json({ status: 0, token, user });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 99, message: "Erreur serveur." });
  }
};


exports.getUser =  async (req, res) => {

    try{

      const user = await User.findOne({_id: req.auth.userId});  

      res.status(200).json({status: 0, user}); 

    }catch (err) {
    console.error(err);
    return res.status(500).json({ status: 99, message: "Erreur serveur." });
  }
}


exports.deleteUser = async (req, res) => {

  try{

    await User.updateOne({_id: req.auth.userId}, {$set: {userActive: false}}); 

    res.status(200).json({status: 0});

  }catch(err){

    console.error(err);
    return res.status(500).json({ status: 99, message: "Erreur serveur." });
  }
    
}