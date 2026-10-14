import { BaseController } from "./base.controller";
import {Pharmacist} from "../models/pharmacist.model"
import { PharmacistService } from "../services/pharmacist.service";
import { NextFunction, Request, Response } from 'express';
import mongoose from "mongoose";
import { MedicineService } from "../services/medicine.service";
import { AccessoryService } from "../services/accessory.service";
import { pharmacistOrderService } from "../services/pharmacistOrder.service";


export class PharmacistController extends BaseController<Pharmacist>
{
    _serviceObj=new PharmacistService();
    _medicineService=new MedicineService();
    _accessoryService=new AccessoryService();
    _pharmacistOrderService=new pharmacistOrderService();
    /**
   * https://kb.objectrocket.com/mongo-db/mongoose-partial-text-search-606
   * @param request autoComplete Search
   * @param response 
   * @param next 
   */
  autoCompleteSearchByFullName=async (request: Request, response: Response, next: NextFunction) => {

    try{
       let data= await this._serviceObj.autoCompleteSearch({fullName:{$regex:request.query,$options:"i"}},"_id fullName")
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
       let data=await  this._serviceObj.autoCompleteSearch({phoneNumber:{$regex:request.query,$options:"i"}},"_id phoneNumber")
       response.status(200).json(data);
    }catch(error)
    {
      next(error)
    }
  }

  /**
     * add accessory to cart
     * @param request 
     * @param response 
     * @param next 
     */
   addAccessoryToCart=async(request: any, response: Response, next: NextFunction) => {

    try {
        if(request.jwt.role!="pharmacist") throw new Error("Not Authorized....");
        if(request.body.quantity<=0) throw new Error(" wrong quantity");
        let product:any=await this._accessoryService.findAllAggregate(
        [
          {$match:{_id:new mongoose.Types.ObjectId(request.body.product)}}
          ,{$project:{_id:1,"stockAmount":1}}
        ]
      );
        
            if(product.length==0)
            throw new Error("this accessory is no longer exists..");
            // if(product.stockAmount==0)
            // throw new Error("this product is out of stock..");

            //what if quantity> stock amount
            if(product[0].stockAmount<request.body.quantity)
            throw new Error("stock amount is not compitable with the quanity")
           

            let data=await this._serviceObj.updateOnewithCondition(
              {_id:request.jwt.id},//,"cart.products.id":{$nin:[request.body.product]}},
              {
                  
                $pull:{"cart.accessories":{id:request.body.product}}
              }
            );

            data =await this._serviceObj.updateOnewithCondition(
              {_id:request.jwt.id},//,"cart.products.id":{$nin:[request.body.product]}},
              {
                  
                  $addToSet:{"cart.accessories":{id:request.body.product,quantity:request.body.quantity}}
              }
            );
            response.status(200).json({"message":"updated"});
        }catch (error) {
           next(error);
        }  
}
   /**
     * add medicine to cart
     * @param request 
     * @param response 
     * @param next 
     */
    addMedicineToCart=async(request: any, response: Response, next: NextFunction) => {

      try {
         
          if(request.body.quantity<=0) throw new Error(" wrong quantity");
          let product:any=await this._medicineService.findAllAggregate(
          [
            {$match:{_id:new mongoose.Types.ObjectId(request.body.product)}}
            ,{$project:{_id:1,"stockAmount":1}}
          ]
        );
          
              if(product.length==0)
              throw new Error("this Medicine is no longer exists..");
              // if(product.stockAmount==0)
              // throw new Error("this product is out of stock..");
  
              //what if quantity> stock amount
              if(product[0].stockAmount<request.body.quantity)
              throw new Error("stock amount is not compitable with the quanity")
             
  
              let data=await this._serviceObj.updateOnewithCondition(
                {_id:request.jwt.id},//,"cart.products.id":{$nin:[request.body.product]}},
                {
                    
                  $pull:{"cart.medicines":{id:request.body.product}}
                }
              );
  
              data =await this._serviceObj.updateOnewithCondition(
                {_id:request.jwt.id},//,"cart.products.id":{$nin:[request.body.product]}},
                {
                    
                    $addToSet:{"cart.medicines":{id:request.body.product,quantity:request.body.quantity}}
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
      this._serviceObj._populate="cart.accessories.id cart.medicines.id"
      // this._serviceObj._select={name:1,unitPrice:1,stockAmount:1,images:{$slice:["$images",1]}};
      
      let data:any =await this._serviceObj.findOneById(new mongoose.Types.ObjectId(request.jwt.id),"");//"cart.products");
      
      if(data==null)
      throw new Error("doctor doesn't Exists anymore....");

      //don't return non exists products with id populat with null
     
      let medicines:any=[];
      let accessories:any=[];
      let totalPrice:any=0;
       if(data.cart.medicines.findIndex((medicine:any)=>medicine.id==null)!=-1)
       {
            data.cart.medicines.forEach((product:any)=>{
            
              if (product.id!=null)
              medicines.push(product);
              else
              {
                let update:any =this._serviceObj.updateOne(new mongoose.Types.ObjectId(  request.jwt.id)
                  ,{
                    $pull:{"cart.medicines":{id:null}}
                  }
                )
              }
            });  

            data.cart.medicines=medicines; //set the retun data with the new products
       }
       totalPrice= data?.cart.medicines.reduce((current:any,product:any)=>current+(product.unitPrice*product.stockAmount),0)    

       if(data.cart.accessories.findIndex((accessory:any)=>accessory.id==null)!=-1)
       {
            data.cart.accessories.forEach((product:any)=>{
            
              if (product.id!=null)
              accessories.push(product);
              else
              {
                let update:any =this._serviceObj.updateOne(new mongoose.Types.ObjectId(  request.jwt.id)
                  ,{
                    $pull:{"cart.accessories":{id:null}}
                  }
                )
              }
            });  

            data.cart.accessories=accessories; //set the retun data with the new products
       }
       totalPrice+= data?.cart.accessories.reduce((current:any,product:any)=>current+(product.unitPrice*product.stockAmount),0)    

      response.status(200).json(data);
  } catch (error) {
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
          
              let data =await this._serviceObj.updateOnewithCondition(
                {
                 _id:request.jwt.id
                },
              {
                  $pull:{"cart.medicines":{id:request.body.product},"cart.accessories":{id:request.body.product}}//for old schema
              }
            );
            response.status(200).json({"message":"updated"});
        }catch (error) {
           next(error);
        }  
}

 /**
     * add medicine to wishlist
     * @param request 
     * @param response 
     * @param next 
     */
  addMedicineToWishList=async(request: any, response: Response, next: NextFunction) => {

    try {
     
            let data =await this._serviceObj.updateOne(
              request.jwt.id,
              {
                  $addToSet:{"wishList.medicines":request.body.product}
              }
            );
            response.status(200).json({"message":"updated"});
        }catch (error) {
           next(error);
        }  
}

/**
     * add accessory to wishlist
     * @param request 
     * @param response 
     * @param next 
     */
 addAccessoryToWishList=async(request: any, response: Response, next: NextFunction) => {

  try {
   
          let data =await this._serviceObj.updateOne(
            request.jwt.id,
            {
                $addToSet:{"wishList.accessories":request.body.product}
            }
          );
          console.log(data);
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
      
            let data =await this._serviceObj.updateOnewithCondition(
              {
                 _id:request.jwt.id
              },
            {
                $pull:{"wishList.medicines":request.body.product ,"wishList.accessories":request.body.product}
            }
          );
          response.status(200).json({"message":"updated"});
      }catch (error) {
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
    this._serviceObj._populate="wishList.medicines wishList.accessories"

    
      let data:any =await this._serviceObj.findOneById(
      new mongoose.Types.ObjectId(  request.jwt.id),"wishList.medicines wishList.accessories");

    //don't return non exists products with id populat with null
     
    let medicines:any=[];
    let accessories:any=[];
    
     if(data.wishList.medicines.findIndex((medicine:any)=>medicine.id==null)!=-1)
     {
          data.wishList.medicines.forEach((product:any)=>{
          
            if (product.id!=null)
            medicines.push(product);
            else
            {
              let update:any =this._serviceObj.updateOne(new mongoose.Types.ObjectId(  request.jwt.id)
                ,{
                  $pull:{"wishList.medicines":{id:null}}
                }
              )
            }
          });  

          data.wishList.medicines=medicines; //set the retun data with the new products
     }
    

     if(data.wishList.accessories.findIndex((accessory:any)=>accessory.id==null)!=-1)
     {
          data.wishList.accessories.forEach((product:any)=>{
          
            if (product.id!=null)
            accessories.push(product);
            else
            {
              let update:any =this._serviceObj.updateOne(new mongoose.Types.ObjectId(  request.jwt.id)
                ,{
                  $pull:{"wishList.accessories":{id:null}}
                }
              )
            }
          });  

          data.wishList.accessories=accessories; //set the retun data with the new products
     }
    

      response.status(200).json(data);
  } catch (error) {
    next(error);
  }

}


// getProfile=async (request: any, response: Response, next: NextFunction) => {

//   try {
  
//     let doctor:any=await this._serviceObj.findOneById(new mongoose.Types.ObjectId( request.jwt.id),"");
//     doctor.password=null;
//     let latePaid:any=await this._orderService.findAllAggregate([
//       {$match:{userId:doctor._id,
//        "payment.details.late":{$ne:0},"orderStatus":{$nin:["cancelled"]}}},
//        {$group:{_id:"$userId",lateMoney:{$sum:"$payment.details.late"}}},
//        {$project:{lateMoney:1,_id:0}}
//   ]);
//   let totalOrders:any=await this._orderService.findAllAggregate([
//     {$match:{userId:doctor._id,
//      "orderStatus":{$nin:["cancelled"]}}},
//      {$group:{_id:"$userId",totalOrders:{$sum:1}}},
//      {$project:{totalOrders:1,_id:0}}
// ]);
//   if(totalOrders[0]!=undefined)
//   totalOrders=totalOrders[0].totalOrders;
//   else
//   totalOrders=0;

//   if(latePaid[0]!=undefined)
//   latePaid=latePaid[0].lateMoney;
//   else
//   latePaid=0;
  
//   response.status(200).json({doctor,latePaid,totalOrders,userType:"doctor"});
//   }
//   catch(error)
//   {next(error)}
// }


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

          getProfile=async (request: any, response: Response, next: NextFunction) => {

            try {
            
              let doctor:any=await this._serviceObj.findOneById(new mongoose.Types.ObjectId( request.jwt.id),"");
              doctor.password=null;
              let latePaid:any=await this._pharmacistOrderService.findAllAggregate([
                {$match:{userId:doctor._id,
                 "payment.details.late":{$ne:0},"orderStatus":{$nin:["cancelled"]}}},
                 {$group:{_id:"$userId",lateMoney:{$sum:"$payment.details.late"}}},
                 {$project:{lateMoney:1,_id:0}}
            ]);
            let totalOrders:any=await this._pharmacistOrderService.findAllAggregate([
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
            
            response.status(200).json({pharmacist:doctor,latePaid,totalOrders,userType:"pharmacist"});
            }
            catch(error)
            {next(error)}
          }
          
}
