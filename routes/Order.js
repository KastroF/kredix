const express = require("express"); 

const router = express.Router(); 

const orderCtrl = require("../controllers/Order"); 

const auth = require("../middleware/auth"); 

router.post("/addorder", auth, orderCtrl.addOrder);


module.exports = router; 