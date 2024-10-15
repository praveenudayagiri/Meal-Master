const validator = require('validator');
const validateSignUpData=(req)=>{
    const {name, gmail, password} = req.body;
    if(!name){
        throw new Error("Name is not valid");
    }
    else if(name.length<4 || name.length>50){
        throw new Error("Name must be between 4 and 50 characters");
    }
    else if(!validator.isEmail(gmail)){
        throw new Error("Email is not valid");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Please eneter a strong password");
    }
    
};
module.exports={
    validateSignUpData,
};