const jwt=require('jsonwebtoken')
const tokenBlackListModel = require('../models/blacklist.model')

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'careerpilot_jwt_secret_key_2026_super_secret';

async function authUser(req,res,next){
    const token=req.cookies.token
    if(!token){
        return res.status(401).json({
            message:"token not provided"
        })
    }

    const isTokenBlackListed=await tokenBlackListModel.findOne({token})
    if(isTokenBlackListed){
        return res.status(401).json({
            message:"token is invalid"
        })
    }
    try{
        const decoded=jwt.verify(token, JWT_SECRET)
        req.user= decoded
        next()
    }catch(err){
        return res.status(401).json({
            message:"invalid token"
        })
    }
    

}
module.exports={authUser}