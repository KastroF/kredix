const Tontine = require("../models/Tontine"); 

function generateCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789@#$%&*';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    return code;
  }


  exports.getTontines = async (req, res) => {

    try{

        const myTontines = await Tontine.find({userId: req.auth.userId}).sort({created_at: -1})
        .limit(4); 

        const otherTontines = await Tontine.find({ userId: { $ne: req.auth.userId } })
        .sort({ created_at: -1 })
        .limit(6);

        res.status(200).json({status: 0, myTontines, otherTontines});
        

    }catch(err){

        console.log(err); 
        res.status(505).json({err}); 
    }

  }

exports.addTontine = async (req, res) => {

    try{

        const {name, headname, description} = req.body; 

        const count = await Tontine.countDocuments({
            name: { $regex: `^${name}$`, $options: "i" }
          });

        if(count > 0){

            return res.status(200).json({status: 1, message: "Une tontine ayant ce nom existe déjà"})

        }

        const code = generateCode(); 


        const newTontine = new Tontine({
            name, 
            headname, 
            description, 
            code, 
            userId: req.auth.userId
        })
    
        await newTontine.save(); 
    
        res.status(201).json({status: 0, code}); 


    }catch(err){

        console.log(err); 
        res.status(505).json({err}); 
    }


    
}