const Tontine = require("../models/Tontine"); 


exports.addTontine = async (req, res) => {

    try{

        const {name, headname, description} = req.body; 

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