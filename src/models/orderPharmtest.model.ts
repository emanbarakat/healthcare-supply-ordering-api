import mongoose from "mongoose";
export interface PharmacistOrder
{
    userId:mongoose.Types.ObjectId,
    medicines:[{
        id:mongoose.Types.ObjectId,
        name:string,
        quantity:number,
        unitPrice:number,
        image:string
    }],
    accessories:[{
        id:mongoose.Types.ObjectId,
        name:string,
        quantity:number,
        unitPrice:number,
        image:string
    }],
    totalPrice:number,
    orderDate:string,
    deliverInfo:{
        date:string,
        time:string,
        address:{
            addressName:string,
            governorate:string,
            city:string,
            street:number,
            building:number,
            details:string
        }
        flyBoy:mongoose.Types.ObjectId
    },
    orderStatus:{type:string},

    payment:{
        method:{type:string},
        details:{
            paid:number,
            late:number,
            // paymentStatus:string 
        }
    }  
}
const addressSchema=new mongoose.Schema({
    addressName:String,
    governorate:String,
    city:String,
    street:Number,
    building:Number,
    details:String
  
  }, { _id : false });
const schema =new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId},
    medicines:[{
        _id:false,
        id:{type:mongoose.Types.ObjectId,ref:'medicines'},
        name:String,
        quantity:Number,
        unitPrice:Number,
        image:String
    }],
    accessories:[{
        _id:false,
        id:{type:mongoose.Types.ObjectId,ref:'accessories'},
        name:String,
        quantity:Number,
        unitPrice:Number,
        image:String
    }],
    totalPrice:{
    type:Number,
    default:function(){ 
        let schemaObject:any=this;
        let medicineTotal= schemaObject.medicines?.reduce((current:any,product:any)=>{
            return current+(product.unitPrice*product.quantity)
        },0); 

        return schemaObject.accessories?.reduce((current:any,product:any)=>{
            return current+(product.unitPrice*product.quantity)
        },medicineTotal); 
    },
    set:function(value:number)
    { 
        if(value!=undefined) return value;
        let schemaObject:any=this;
        let medicineTotal= schemaObject.medicines?.reduce((current:any,product:any)=>{
            return current+(product.unitPrice*product.quantity)
        },0); 

        return schemaObject.accessories?.reduce((current:any,product:any)=>{
            return current+(product.unitPrice*product.quantity)
        },medicineTotal);
    }
    },
    orderDate:{
        type:String,default:(new Date()).toLocaleString().split(",")[0]
        ,match:[/^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])\/(?:[0-9]{2})?[0-9]{2}$/gm,"incorrcet date format mm/dd/yy"]
    },
    deliverInfo:{
        date:{
            type:String,
            match:[/^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])\/(?:[0-9]{2})?[0-9]{2}$/gm,"incorrcet date format mm/dd/yy"]
            
        },
        time:{
            type:String,
            match:[/^(0?[1-9]|1[0-2]):([0-5]\d)\s?((?:A|P)\.?M\.?)$/," invalida time format HH:MM AM|PM"]
        },
        address:addressSchema,
        flyBoy:{type:mongoose.Types.ObjectId,ref:"flyboys"}
    },
    orderStatus:{
        type:String,
        enum:["pending","delivered","cancelled",
             "shipped","refund","on the way"],default:"pending",
    },
    payment:{
        method:{type:String, enum:["cash","credit"]},
        details:{
            paid:{
                type:Number
            },
            late:{
                type:Number,
                // set:function(){
                //     // let schemaObject:any=this;
                //     // console.log("set late",schemaObject.payment);
                //     // console.log(schemaObject.totalPrice!=undefined && schemaObject.payment.method=="credit")
                //     // console.log(schemaObject.totalPrice!=undefined && schemaObject.payment.method=="cash")
                //     // if(schemaObject.totalPrice!=undefined && schemaObject.payment.method=="credit")
                //     // return schemaObject.totalPrice-schemaObject.payment.details.paid
                //     // else if(schemaObject.totalPrice!=undefined && schemaObject.payment.method=="cash")
                //     // return 0
                //     // else return;
                // },
                default:function(){
                    let schemaObject:any=this;
                    console.log("default late",schemaObject.payment);
                    if(schemaObject.totalPrice!=undefined && schemaObject.payment.method=="credit")
                    return schemaObject.totalPrice-schemaObject.payment.details.paid
                    else if(schemaObject.totalPrice!=undefined && schemaObject.payment.method=="cash")
                    return 0
                }},        
        }
    }
});
const PharmacistOrderModel=mongoose.model("orderspharmacist",schema);
export {PharmacistOrderModel}