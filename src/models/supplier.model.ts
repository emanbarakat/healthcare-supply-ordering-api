import mongoose from "mongoose";

 export interface Supplier{
    _id: mongoose.Types.ObjectId,
    fullName:string,
   
    phoneNumber:string,
    whatsAppNumber :string,
    email:string,
    products:[mongoose.Types.ObjectId],
    medicines:[mongoose.Types.ObjectId],
    addresses:[{
        addressName:String,
        governorate:String,
        city:String,
        street:String,
        building:Number,
        details:String
      }]  
}
const addressSchema=new mongoose.Schema({
    addressName:String,
    governorate:String,
    city:String,
    street:String,
    building:Number,
    details:String
  
  }, { _id : false });
const schema =new mongoose.Schema({
    fullName:{
        type:"string",
        required:true
    },
    addresses:[addressSchema],
    email:{
        type:"string"
    },
    phoneNumber:{
        type:String,
        match:[/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/,"not valid"],
        required:true
       }
  ,
  whatsAppNumber:{
    type:String,
    match:[/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/,"not valid"]
  },
  products:[{type:mongoose.Types.ObjectId,ref:"products"}],
  medicines:[{type:mongoose.Types.ObjectId,ref:"medicines"}]
  
});

const SupplierModel=mongoose.model("suppliers",schema);
export {SupplierModel}