const express = require("express"); 

const router = express.Router(); 

const tontineCtrl = require("../controllers/Tontine"); 
const auth = require("../middleware/auth"); 

router.post("/add", auth, tontineCtrl.addTontine);
router.get("/gettontines", auth, tontineCtrl.getTontines);
router.post("/testcode", auth, tontineCtrl.testCode)
module.exports = router; 