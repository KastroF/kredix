const express = require("express"); 

const router = express.Router(); 

const orderCtrl = require("../controllers/Order"); 

const auth = require("../middleware/auth"); 

router.post("/addorder", orderCtrl.addOrder);
router.post("/callback", orderCtrl.callback)
router.get("/pendingorder", auth, orderCtrl.getPendingOrder)
router.post("/updateorder", auth, orderCtrl.updateOrder); 
router.post("/getorders", auth, orderCtrl.getOrders); 
router.post("/updateorder2", auth, orderCtrl.updateOrder2); 

module.exports = router; 