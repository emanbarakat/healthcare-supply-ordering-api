import mongoose from "mongoose";
const schema=new mongoose.Schema({
   id:String,
   governorate_name_ar:String,
   governorate_name_en:String
});


const GovernorateModel=mongoose.model("governorates",schema);
export {GovernorateModel}