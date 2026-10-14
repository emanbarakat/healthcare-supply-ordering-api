import mongoose from "mongoose";
import bcrypt=require("bcrypt");


export  interface FlyBoy{
  _id: mongoose.Types.ObjectId,
  userName:string,
  phoneNumber:string,
  password:string  ,
  acountStatus:string,
  address:{
    governorate:String,
    city:String,
    street:String,
    building:Number
  }
};
const addressSchema=new mongoose.Schema({
  governorate:String,
  city:String,
  street:String,
  building:Number

}, { _id : false });
const schema=new mongoose.Schema({
        userName:String,
        phoneNumber:{
              type:String,
              $regex:/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/
            },
           
        password:{
          type:String, 
          required:true ,
          // $regex:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/
        }
        ,
        accountStatus:{type:String,
                        enum:["active","blocked"],
                        default:"active"
                      },
        address:addressSchema,
}, { timestamps: true });



const FlyBoyModel=mongoose.model("flyboys",schema);
export {FlyBoyModel}
