import mongoose from "mongoose";

 export interface Accessory{
    _id: mongoose.Types.ObjectId,
    name:string,
    brand:{id:mongoose.Types.ObjectId,name:string},
    subCategory:{id:mongoose.Types.ObjectId,name:string},
    description:string,
    images:[{
        url:String,
        couldinaryId:String
    }],
    basePrice:number,
    unitPrice:number,
    stockAmount:number,
    creditDiscount:number,
    cashDiscount:number,
    madeIn:string,
    productionDate:String,
    expireDate:String,
    offer:String,
    reviews:{
        userId:mongoose.Types.ObjectId,
        reviewText:string,
        reviewRate:number
    },
    active:boolean
}
const reviewsSchema=new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    reviewText:String,
    reviewRate:Number
},{_id:false}); 

const schema =new mongoose.Schema({
    name:{
        type:"string",
        required:true
    },
    brand:{ id:{type:mongoose.Types.ObjectId,ref:"brands"},
            name:String
        },
    subCategory:{
        id:{type:mongoose.Types.ObjectId, ref:"subcategories"},
        name:String
    },
    description:String,
    images:[{
        _id:false,
        url:{type:String},
        cloudinaryId:{type:String}
    }],
    basePrice:{type:Number},
    unitPrice:{type:Number},
    stockAmount:{type:Number},
    creditDiscount:{type:Number},
    cashDiscount:{type:Number},
    madeIn:{type:String},
    productionDate:{
        type:String
        ,match:[/^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])\/(?:[0-9]{2})?[0-9]{2}$/gm,"incorrcet date format mm/dd/yy"]
    }
    ,expireDate:{
        type:String
        ,match:[/^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])\/(?:[0-9]{2})?[0-9]{2}$/gm,"incorrcet date format mm/dd/yy"]
    },
    reviews:{type:reviewsSchema},
    offer:{type:String},
    active:{type:Boolean , default:true}
});

const AccessoryModel=mongoose.model("accessories",schema);
export {AccessoryModel}