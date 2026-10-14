import mongoose from "mongoose";

export interface SubCategory
{
    _id: mongoose.Types.ObjectId,
    name:string,
    sub_category_type:string,
    image:{
        url:String,
        cloudinaryId:String
    }
    // products:[mongoose.Types.ObjectId],
    // medicines:[mongoose.Types.ObjectId]
}

const schema =new mongoose.Schema({
    name:{
        type:"string",
        required:true
    },
    category:{
        type:mongoose.Types.ObjectId,ref:"categories",
        required:true
    },
    // products:[{type:mongoose.Types.ObjectId,ref:"products"}],
    // medicines:[{type:mongoose.Types.ObjectId,ref:"medicines"}]
    image:{
        _id:false,
        url:{type:String},
        cloudinaryId:{type:String}
    }
});

const SubCategoryModel=mongoose.model("subcategories",schema);
export {SubCategoryModel}