import mongoose from "mongoose";
const schema=new mongoose.Schema({
   id:String,
   governorate_id:String,
   governorate_name_ar:String,
   governorate_name_en:String
});


const CityModel=mongoose.model("cities",schema);
export {CityModel}