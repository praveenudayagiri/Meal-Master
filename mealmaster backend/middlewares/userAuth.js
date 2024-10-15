const jwt = require("jsonwebtoken");
const User = require("../config/models/user");

const userAuth = async (req, res, next)=>{
    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error("Please Login...!");
        }
        const decodedObj = await jwt.verify(token,"Batch13$9701");
        const {_id} = decodedObj;
        const user = await User.findById(_id);
        if(!user){
            throw new Error("User is not valid....!");
        }
        req.user = user;
        next();
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
};
module.exports = userAuth;