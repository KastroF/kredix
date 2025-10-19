const Tontine = require("../models/Tontine"); 


exports.addTontine = async (req, res) => {

    try{

        const {name, headname, description} = req.body; 

        const count = await Tontine.countDocuments({name}); 

        if(count === 0){

            res.status(200).json({status: 1, message: "Une tontine ayant ce nom existe déjà"})

        }

        const newTontine = new Tontine({
            name, 
            headname, 
            description
        })
    
        newTontine.save(); 
    
        res.status(201).json({status: 0}); 


    }catch(err){

        console.log(err); 
        res.status(505).json({err}); 
    }


    
}