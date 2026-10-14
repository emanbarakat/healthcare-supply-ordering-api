import mongoose from "mongoose";
import bcrypt=require("bcrypt");


export  interface Admin{
  _id: mongoose.Types.ObjectId,
  userName:string,
  phoneNumber:string,
  password:string  ,
  acountStatus:string,
  level:String
};

const schema=new mongoose.Schema({
        userName:String,
        phoneNumber:{
              type:String,
              $regex:/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/
            },
            level:{
              type: String,
              enum:["admin","subAdmin"]
            },
        password:{
          type:String, 
          required:true ,
          // $regex:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/
        }
        ,
        accountStatus:{type:String,
                        enum:["active","disactive","blocked"],
                        default:"active"
                      }
        ,
        cashDiscount:{
          type:Number,
          default:0,
          immutable: (doc:any) => doc.level !== 'admin'
          // set:function(value:number)
          // { 
              
          //     let schemaObject:any=this;
          //     if(schemaObject.level=="admin")
          //     {
          //         return value;
          //     } 
          //     else
          //     {
          //       return new Error("Can't set cash discount");
          //     }
          // }
        }
}, { timestamps: true });


const AdminModel=mongoose.model("admins",schema);
export {AdminModel}
