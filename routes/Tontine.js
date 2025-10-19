const express = require("express"); 

const router = express.Router(); 

const tontineCtrl = require("../controllers/Tontine"); 
const auth = require("../middleware/auth"); 

router.post("/add", auth, tontineCtrl.addTontine);

module.exports = router; 