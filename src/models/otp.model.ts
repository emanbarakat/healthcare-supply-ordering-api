import mongoose from "mongoose";


const Otp=new mongoose.Schema({
    number:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        index:{expires:50}
    }
},{timestamps:true});