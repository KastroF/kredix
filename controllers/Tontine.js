const Tontine = require("../models/Tontine"); 

function generateCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    return code;
  }



exports.addTontine = async (req, res) => {

    try{

        const {name, headname, description} = req.body; 

        const count = await Tontine.countDocuments({name}); 

        if(count > 0){

            return res.status(200).json({status: 1, message: "Une tontine ayant ce nom existe déjà"})

        }

        const code = generateCode(); 


        const newTontine = new Tontine({
            name, 
            headname, 
            description, 
            code
        })
    
        await newTontine.save(); 
    
        res.status(201).json({status: 0, code}); 


    }catch(err){

        console.log(err); 
        res.status(505).json({err}); 
    }


    
}