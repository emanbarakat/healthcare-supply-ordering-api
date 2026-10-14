import { BaseController } from "./base.controller";
import {Doctor} from "./../models/doctor.model"

import { DoctorService } from "../services/doctor.service";
import { ProductService } from "../services/product.service";
import { NextFunction, Request, Response } from 'express';
import mongoose, { mongo } from "mongoose";
import { OrderService } from "../services/order.service";



export class DoctorController extends BaseController<Doctor>
{
    _serviceObj=new DoctorService();
    _productSevice=new ProductService();
    _orderService=new OrderService();
    
  /**
   * https://kb.objectrocket.com/mongo-db/mongoose-partial-text-search-606
   * @param request autoComplete Search
   * @param response 
   * @param next 
   */
  autoCompleteSearchByFullName=async (request: Request, response: Response, next: NextFunction) => {
   
    try{
       let data= await  this._serviceObj.autoCompleteSearch({"fullName":{$regex: request.params.value+"",$options:"i"}},"_id fullName")
     
       response.status(200).json(data);
    }catch(error)
    {
      next(error)
    }
  }

    /**
   * https://kb.objectrocket.com/mongo-db/mongoose-partial-text-search-606
   * @param request autoComplete Search
   * @param response 
   * @param next 
   */
     autoCompleteSearchByPhoneNumber=async (request: Request, response: Response, next: NextFunction) => {

      try{
         let data=await  this._serviceObj.autoCompleteSearch({phoneNumber:{$regex:request.params.value,$options:"i"}},"_id phoneNumber")
         response.status(200).json(data);
      }catch(error)
      {
        next(error)
      }
    }

    
       /**
        * add new Address for doctor
        * @param request 
        * @param response 
        * @param next 
        */
        doctorNewAddress=async(request:any,response:Response,next:NextFunction)=>{
        
          try{
  
  
              let data=await this._serviceObj.updateOne(new mongoose.Types.ObjectId(request.jwt.id),{
                  $push:{addresses:request.body.address}
              });
  
              let doctor:any=await this._serviceObj.findOneById(new mongoose.Types.ObjectId(request.jwt.id),"");
              doctor.password=null;
  
              response.status(200).json(doctor);
  
          }
          catch(error)
          {
              next(error);
          }
      
      
          }

    /**
     * add product to cart
     * @param request 
     * @param response 
     * @param next 
     */
    addToCart=async(request: any, response: Response, next: NextFunction) => {

      try {
          if(request.jwt.role!="doctor") throw new Error("Not Authorized");
          if(request.body.quantity<=0) throw new Error(" wrong quantity");
        let product:any=await this._productSevice.findAllAggregate(
          [
            {$match:{_id:new mongoose.Types.ObjectId(request.body.product)}}
            // ,
            // {"$project":{"name":1,"unitPrice":1,"stockAmount":1,
            // "image":{"$first":"$images"}}}
            ,{$project:{_id:1,"stockAmount":1}}
          ]
        );
          
              if(product.length==0)
              throw new Error("this product is no longer exists..");
              // if(product.stockAmount==0)
              // throw new Error("this product is out of stock..");

              //what if quantity> stock amount
              if(product[0].stockAmount<request.body.quantity)
              throw new Error("stock amount is not compitable with the quanity")
             

              let data=await this._serviceObj.updateOnewithCondition(
                {_id:request.jwt.id},//,"cart.products.id":{$nin:[request.body.product]}},
                {
                    
                  $pull:{"cart.products":{id:request.body.product}}
                }
              );

              data =await this._serviceObj.updateOnewithCondition(
                {_id:request.jwt.id},//,"cart.products.id":{$nin:[request.body.product]}},
                {
                    
                    $addToSet:{"cart.products":{id:request.body.product,quantity:request.body.quantity}}
                }
              );
              response.status(200).json({"message":"updated"});
          }catch (error) {
             next(error);
          }  
  }
  /**
   * remove product from cart
   * @param request 
   * @param response 
   * @param next 
   */
  removeFromCart=async(request: any, response: Response, next: NextFunction) => {

    try {
              if(request.jwt.role!="doctor") throw new Error("Not Authorized");
              let data =await this._serviceObj.updateOnewithCondition(
                {
                _id:request.jwt.id
                },
              {
                  $pull:{"cart.products":{id:request.body.product}}//for old schema
                  // $pull:{"cart.products":request.body.product}
              }
            );
            response.status(200).json({"message":"updated"});
        }catch (error) {
           next(error);
        }  
}
 /**
     * add product to wishlist
     * @param request 
     * @param response 
     * @param next 
     */
  addToWishList=async(request: any, response: Response, next: NextFunction) => {

    try {
     
      // let product:any=await this._productSevice.findAllAggregate(
      //   [
      //     {$match:{_id:new mongoose.Types.ObjectId(request.body.product)}}
      //     ,{$project:{_id:1}}

      //   ]
      // );

            // if(product==null)
            // throw new Error("this product is no longer exists..");
            // if(product.stockAmount==0)
            // throw new Error("this product is out of stock..");
            if(request.jwt.role!="doctor") throw new Error("Not Authorized");
            let data =await this._serviceObj.updateOne(
              request.jwt.id,
              {
                  $addToSet:{"wishList.products":request.body.product}
              }
            );
            response.status(200).json({"message":"updated"});
        }catch (error) {
           next(error);
        }  
}
/**
 * remove product from wishlist
 * @param request 
 * @param response 
 * @param next 
 */
removeFromWishList=async(request: any, response: Response, next: NextFunction) => {

  try {
            if(request.jwt.role!="doctor") throw new Error("Not Authorized");
            let data =await this._serviceObj.updateOnewithCondition(
              {
              _id:request.jwt.id
              },
            {
                $pull:{"wishList.products":request.body.product}
            }
          );
          response.status(200).json({"message":"updated"});
      }catch (error) {
         next(error);
      }  
}

/**
 * 
 * @param request get cart products for by doctor id
 * @param response 
 * @param next 
 */
getCartProducts=async (request: any, response: Response, next: NextFunction) => {
      try {
          //first get 
          this._serviceObj._populate="cart.products.id"
          // this._serviceObj._select={name:1,unitPrice:1,stockAmount:1,images:{$slice:["$images",1]}};
          
          let data:any =await this._serviceObj.findOneById(new mongoose.Types.ObjectId(request.jwt.id),"");//"cart.products");
          
          if(data==null)
          throw new Error("doctor doesn't Exists anymore....");

          //don't return non exists products with id populat with null
          let products:any=[];
         
          data.cart.products.forEach((product:any)=>{
          
            if (product.id!=null)
            products.push(product);
            else
            {
              let update:any =this._serviceObj.updateOne(new mongoose.Types.ObjectId(  request.jwt.id)
                ,{
                  $pull:{"cart.products":{id:null}}
                }
              )
            }
          });  

          data.cart.products=products; //set the retun data with the new products
        // let totalPrice= data?.cart.products.reduce((current:any,product:any)=>current+(product.unitPrice*product.stockAmount),0)  
          response.status(200).json({data});
          // response.status(200).json(data);
      } catch (error) {
        next(error);
      }
}
/**
 * get wishList products by doctor id
 * @param request 
 * @param response 
 * @param next 
 */
getWishProducts=async (request: any, response: Response, next: NextFunction) => {

  try {
    this._serviceObj._populate="wishList.products"

    
      let data:any =await this._serviceObj.findOneById(
      new mongoose.Types.ObjectId(  request.jwt.id),"wishList.products ");

      let products:any=[];
      data.wishList.products.forEach((product:any)=>{
          
        if (product.id!=null)
        products.push(product);
        else
        {
          let update:any =this._serviceObj.updateOne(new mongoose.Types.ObjectId(  request.jwt.id)
            ,{
              $pull:{"wishList.products":{id:null}}
            }
          )
        }
      });  

      data.WishList.products=products; //set the retun data with the new products

      response.status(200).json(data);
  } catch (error) {
    next(error);
  }

}

getProfile=async (request: any, response: Response, next: NextFunction) => {

  try {
  
    let doctor:any=await this._serviceObj.findOneById(new mongoose.Types.ObjectId( request.jwt.id),"");
    doctor.password=null;
    let latePaid:any=await this._orderService.findAllAggregate([
      {$match:{userId:doctor._id,
       "payment.details.late":{$ne:0},"orderStatus":{$nin:["cancelled"]}}},
       {$group:{_id:"$userId",lateMoney:{$sum:"$payment.details.late"}}},
       {$project:{lateMoney:1,_id:0}}
  ]);
  let totalOrders:any=await this._orderService.findAllAggregate([
    {$match:{userId:doctor._id,
     "orderStatus":{$nin:["cancelled"]}}},
     {$group:{_id:"$userId",totalOrders:{$sum:1}}},
     {$project:{totalOrders:1,_id:0}}
]);
  if(totalOrders[0]!=undefined)
  totalOrders=totalOrders[0].totalOrders;
  else
  totalOrders=0;

  if(latePaid[0]!=undefined)
  latePaid=latePaid[0].lateMoney;
  else
  latePaid=0;
  
  response.status(200).json({doctor,latePaid,totalOrders,userType:"doctor"});
  }
  catch(error)
  {next(error)}
}



}