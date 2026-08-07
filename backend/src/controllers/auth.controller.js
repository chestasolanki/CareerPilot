const userModel=require('../models/user.model')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
const tokenBlackListModel = require('../models/blacklist.model');

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'careerpilot_jwt_secret_key_2026_super_secret';

/**
 * @name registerUserController
 * @description Register a new user,excepts username, email and password in the req
 * @access public
 */

async function registerUserController(req,res){
    try {
        const{username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(400).json({
                message:"please provide all details"
            })
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();

        const isUserAlreadyExists=await userModel.findOne({
            $or:[{username: cleanUsername},{email: cleanEmail}]
        })

        if(isUserAlreadyExists){
            return res.status(400).json({
                message:"user already exists for this account"
            })
        }

        const hash=await bcrypt.hash(password,10)

        const user =await userModel.create({
            username: cleanUsername,
            email: cleanEmail,
            password:hash
        })

        const token=jwt.sign({id:user._id,username:user.username}, JWT_SECRET,
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
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: err.message || "Registration failed" });
    }
}

/**
 * @name loginUserController
 * @description Login user with email and password
 * @access public
 */

async function loginUserController(req,res){
    try {
        const {email,password}=req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" })
        }

        const cleanEmail = email.trim().toLowerCase();
        const user=await userModel.findOne({email: cleanEmail})

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
            JWT_SECRET,
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
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: err.message || "Login failed" });
    }
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */

async function logoutUserController(req,res){
    try {
        const token=req.cookies.token

        if(token){
            await tokenBlackListModel.create({token})
        }
        res.clearCookie("token")

        res.status(200).json({
            message:"user logged out successful"
        })
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: err.message || "Logout failed" });
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access public
 */
async function getMeController(req,res){
    try {
        const user=await userModel.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json({
            message:"user details fetched successfully",
            user:{
                id:user._id,
                username:user.username,
                email:user.email
            }
        })
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ message: err.message || "Failed to fetch user" });
    }
}
 
module.exports={
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}