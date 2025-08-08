const express = require("express"); 

const router = express.Router(); 

const orderCtrl = require("../controllers/Order"); 

const auth = require("../middleware/auth"); 

router.post("/addorder", auth, orderCtrl.addOrder);
router.post("/callback", orderCtrl.callback)
router.get("/pendingorder", auth, orderCtrl.getPendingOrder)
router.post("/updateorder", auth, orderCtrl.updateOrder); 
router.post("/getorders", auth, orderCtrl.getOrders); 

module.exports = router; 