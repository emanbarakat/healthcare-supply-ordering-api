import mongoose from "mongoose";

export interface Category
{
    _id: mongoose.Types.ObjectId,
    name:string,
    category_type:string,
    image:{url:String,cloudinaryId:String}
}

const schema =new mongoose.Schema({
    name:{
        type:"string",
        required:true
    },
    category_type:{
        type:"string",
        enum:["product","medicine","accessories"],
        required:true
    },
    image:{
        _id:false,
        url:{type:String},
        cloudinaryId:{type:String}
    }
});

const CategoryModel=mongoose.model("categories",schema);
export {CategoryModel}