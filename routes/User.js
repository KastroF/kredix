const express = require("express"); 

const router = express.Router(); 

const userCtrl = require("../controllers/User"); 

const auth = require("../middleware/auth"); 

router.post("/signup", userCtrl.signup);
router.post("/signin", userCtrl.signin); 
router.post("/onenvoi", userCtrl.onEnvoi);
router.get("/getuser", auth, userCtrl.getUser); 
router.get("/deleteuser", auth, userCtrl.deleteUser);
router.get("/montants", auth, userCtrl.getAmounts)
module.exports = router; 