import mongoose from "mongoose";

 export interface Brand{
    _id: mongoose.Types.ObjectId,
    name:string
    // brand_type:string
}

const schema =new mongoose.Schema({
    name:{
        type:"string",
        required:true,
        unique:true,
        
    }
    // brand_type:{
    //     type:"string",
    //     enum:["product","medicine","accessories"]
    // }
});

const BrandModel=mongoose.model("brands",schema);
export {BrandModel}