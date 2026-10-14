import mongoose from "mongoose";
import bcrypt=require("bcrypt");



export  interface Doctor{
  _id: mongoose.Types.ObjectId,
  fullName:string,
  phoneNumber:string,
  whatsAppNumber :string,
  password:string  ,
  acountStatus:string,
  profileImage:string,
  balance:Number,
  addresses:[{
    addressName:String,
    governorate:String,
    city:String,
    street:Number,
    building:Number,
    details:String
  }],
  cart:{
    products:[     {
    id:mongoose.Types.ObjectId
    quantity:Number
    // name:String,
    // untiPrice:Number,
    // stockAmount:Number,
    // image:String
  }
      ]} ,
  wishList:{
    products:[    // {
      mongoose.Types.ObjectId
      // name:String,
      // untiPrice:Number,
      // stockAmount:Number,
      // image:String
    // }
        ]}
  }


const addressSchema=new mongoose.Schema({
  addressName:String,
  governorate:String,
  city:String,
  street:Number,
  building:Number,
  details:String

}, { _id : false });
const schema=new mongoose.Schema({
        fullName:String,
        phoneNumber:{
              type:String,
              match:[/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/,"phone number not valid"],
              required:true
             }
        ,
        whatsAppNumber:{
          type:String,
          match:[/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/,"what's app number not valid"]
        },        
        password:{
          type:String, 
          required:true ,
          // match:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/
        },
        addresses:[addressSchema],
        profileImage:{
          type:String
        },
        accountStatus:{
          type:String,
          enum:["pending","active","disactive","blocked"],
          default:"pending"
        },
        balance:{type:Number,default:0},
        cart:{
          products:[{
            _id:false,
           id: {type:mongoose.Types.ObjectId,ref:"products"},
           quantity:Number
          //   name:{type:String},
          //   unitPrice:{type:Number},
          //   stockAmount:{type:Number},
          //  image:{type:String}
        }]
        },
        wishList:{
          products:[{type:mongoose.Types.ObjectId,ref:"products"}
          // name:{type:String},
          // unitPrice:{type:Number},
          // stockAmount:{type:Number},
          // image:{type:String}

        ]
        }
},
{ timestamps: true });


// schema.methods.comparePassword = function(candidatePassword:string, cb:Function) {
//   bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//       if (err) return cb(err);
//       cb(null, isMatch);
//   });
// };

const DoctorModel=mongoose.model("doctors",schema);
export {DoctorModel}
