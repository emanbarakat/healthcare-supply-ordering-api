import mongoose from "mongoose";
import bcrypt=require("bcrypt");


export  interface Pharmacist{
  _id: mongoose.Types.ObjectId,
  fullName:string,
  phoneNumber:string,
  whatsAppNumber :string,
  password:string  ,
  balance:Number,
  profileImage:string,
  acountStatus:string,
  addresses:[{
    addressName:String,
    governorate:String,
    city:String,
    street:String,
    building:Number,
    details:String
  }],
  cart:{ 
    medicines:[{
      id:mongoose.Types.ObjectId,
      quantity:Number,
  }],
    accessories:[{
      id:mongoose.Types.ObjectId,
      quantity:Number,
    }]},
    wishlist:{ 
      medicines:[{
        _id:mongoose.Types.ObjectId,
       
    }],
      accessories:[{
        _id:mongoose.Types.ObjectId,
        
      }]
  }
  
};
const addressSchema=new mongoose.Schema({
  addressName:String,
  governorate:String,
  city:String,
  street:String,
  building:Number,
  details:String

}, { _id : false });
const schema=new mongoose.Schema({
        fullName:String,
        phoneNumber:{
              type:String,
              match:[/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/,"not valid"]
        },
        whatsAppNumber:{
          type:String,
          match:[/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/,"not valid"]
        }, 
        password:{
          type:String, 
          required:true ,
          // $regex:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/
        }
        ,
        balance:{type:Number,default:0},
        accountStatus:{type:String,
          enum:["pending","active","disactive","blocked"],
          default:"pending"
        },
        profileImage:{
          type:String
        },  
        addresses:[addressSchema]
        ,
        cart:{ 
          medicines:[{
            _id:false,
            id:{type:mongoose.Types.ObjectId,ref:"medicines"},
            quantity:{type:Number},
           
        }],
          accessories:[{
            _id:false,
            id:{type:mongoose.Types.ObjectId,ref:"accessories"},
            quantity:{type:Number},
          }]
        },
        wishList:{
          medicines:[{type:mongoose.Types.ObjectId,ref:"medicines"}],
          accessories:[{type:mongoose.Types.ObjectId,ref:"accessories"}]
        }
},
{ timestamps: true });
const PharmacistModel=mongoose.model("pharmacists",schema);
export {PharmacistModel}

