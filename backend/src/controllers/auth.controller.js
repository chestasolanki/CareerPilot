const userModel=require('../models/user.model')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
const tokenBlackListModel = require('../models/blacklist.model');
/**
 * @name registerUserController
 * @description Register a new user,excepts username, email and password in the req
 * @access public
 */

async function registerUserController(req,res){
    const{username,email,password}=req.body;
    if(!username || !email || !password){
        return res.status(400).json({
            message:"please provide all details"
        })
    }

    const isUserAlreadyExists=await userModel.findOne({
        $or:[{username},{email}]
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message:"user already exists for this account"
        })
    }

    const hash=await bcrypt.hash(password,10)

   const user =await userModel.create({
    username,
    email,
    password:hash
    })

    const token=jwt.sign({id:user._id,username},process.env.JWT_SECRET_KEY,
        {expiresIn:'1d'}
    )
    res.cookie("token",token)

    res.status(201).json({
        message:"user registered",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
 
}

/**
 * @name loginUserController
 * @description Register a new user,excepts username, email and password in the req
 * @access public
 */

async function loginUserController(req,res){
    const {email,password}=req.body

    const user=await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message:"invalid user"
        })
    }

    const ispasswordValid=await bcrypt.compare(password,user.password)

    if(!ispasswordValid){
        return res.status(400).json({
            message:"invalid credentials"
        })
    }

    const token=jwt.sign(
        {id:user._id,username:user.username},
        process.env.JWT_SECRET_KEY,
        {expiresIn:'1d'}
    )

    res.cookie("token",token)

    res.status(200).json({
        message:"user loggedIn successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */

async function logoutUserController(req,res){
    const token=req.cookies.token

    if(token){
        await tokenBlackListModel.create({token})
    }
    res.clearCookie("token")

    res.status(201).json({
        message:"user logged out sucsessful"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access public
 */
async function getMeController(req,res){
    const user=await userModel.findById(req.user.id)
    res.status(200).json({
        message:"user details fetched successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}
 
module.exports={
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}