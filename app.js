const express = require("express"); 
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
require('dotenv').config();

const cors = require('cors');
const requestMap = new Map();
const path = require("path"); 
const fs = require("fs");


//const password = encodeURIComponent("MypassWord@2025!");


const app = express();
app.use(cors());

app.use(express.json({limit: "50mb"})); 
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    next();
  });

mongoose.connect(`mongodb+srv://kredixme:${process.env.MONGOPASS}@cluster0.3rmznly.mongodb.net/kredix?retryWrites=true&w=majority&appName=Cluster0`,

  
  { useNewUrlParser: true,
    useUnifiedTopology: true, autoIndex: true })
  .then(() => {
  
  
  console.log('Connexion à MongoDB réussie !'); 
     
              
    }) 

  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'];
    if (requestId && requestMap.has(requestId)) {
        return res.status(400).send('Duplicate request');
    }
    if (requestId) {
        requestMap.set(requestId, true);
        setTimeout(() => requestMap.delete(requestId), 60000); // Cleanup after 1 minute
    }
    next();
});

const userRouter = require("./routes/User"); 
const tokenRouter = require("./routes/DeviceToken"); 
const orderRouter = require("./routes/Order"); 

//app.use("/", (req, res) => {res.status(201).json({message: "On regarde tres bien. et on aime"})})
app.use("/api/user", userRouter)
app.use("/api/token", tokenRouter);
app.use("/api/order", orderRouter);



module.exports = app;