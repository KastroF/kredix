const express = require("express"); 

const router = express.Router(); 

const orderCtrl = require("../controllers/Order"); 

const auth = require("../middleware/auth"); 

router.post("/addorder", auth, orderCtrl.addOrder);
router.post("/callback", orderCtrl.callback)
router.get("/pendingorder", auth, orderCtrl.getPendingOrder)

module.exports = router; 