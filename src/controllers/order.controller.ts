import { BaseController } from "./base.controller";
import {Order} from "./../models/order.model";


import { OrderService } from "../services/order.service";
import { NextFunction, Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";
import mongoose, { mongo } from "mongoose";
import { ProductService } from "../services/product.service";
import { calculateCurrentDate} from "../core/utils/dateCalculator";



export class OrderController extends BaseController<Order>
{
 
    _serviceObj=new OrderService();
    _doctorService=new DoctorService();
    _productsService=new ProductService();
    /**DONE
     * get doctor data to start confirm order
     * @param request 
     * @param response 
     * @param next 
     */
    confirmOrderForDoctor=async(request:any,response:Response,next:NextFunction)=>{

        try {
            //1-get doctor details 
            let data:any;
            if(request.jwt.role=="doctor")
            data=await this._doctorService.findOneById(new mongoose.Types.ObjectId(request.jwt.id),"");
            // "fullName phoneNumber whatsAppNumber addresses");
            data.password=null;
            /******* authorization */
            if(request.jwt.id!=data?._id) next(new Error("Not Authorized !"))
           
            //2-get late paid for that doctor
            let latePaid:any=await this._serviceObj.findAllAggregate([
                {$match:{userId:new mongoose.Types.ObjectId(request.jwt.id),
                 "payment.details.late":{$ne:0},"orderStatus":{$nin:["cancelled"]}}},
                 {$group:{_id:"$userId",lateMoney:{$sum:"$payment.details.late"}}}
            ])
            
            response.status(200).json({data,lateMoney:latePaid[0]?.lateMoney});
        } catch (error) {
            next(error);
        }
    
       }



       /**DONE
        * when user select specified order on screen to update or cancel or track
        * @param request 
        * @param response 
        * @param next 
        */
       getOrderDetailsForDoctor=async(request:any,response:Response,next:NextFunction)=>{

        try {   
                this._serviceObj._populate="products.id"
                this._serviceObj._select={stockAmount:1, "images.url":1,deliverInfo:1};      
                let orderDetails:any=await this._serviceObj.findOneById(new mongoose.Types.ObjectId(request.params.orderid),"");//"userId products totalPrice orderStatus payment");   
                
                 /******* authorization */
                if(request.jwt.id!=orderDetails?.userId && request.jwt.role=="doctor") next(new Error("Not Authorized"))
                response.status(200).json(orderDetails);        
        } catch (error) {
            next(error);
        }
    
       }

       /**
        * getAll doctor orders paginated
        * @param request 
        * @param response 
        * @param next 
        */
       getAllOrders=async(request:any,response:Response,next:NextFunction)=>{
            try{

                   this._serviceObj._populate="products.id";
                   this._serviceObj._select="name images.url";
                    if (request.params.page==undefined) request.params.page=1;
                    let data=await this._serviceObj.findAll({userId:new mongoose.Types.ObjectId(request.jwt.id)
                    },"",request.params.page,10);
                    response.status(200).json(data);
            }catch(error)
            {
                next(error);
            }

       }

       /**DONE
        * 
        * add order with post and decrease stockamount for that products in DB
        * @param request 
        * @param response 
        * @param next 
        */
       addOrderToDoctor=async (request:any,response:Response,next:NextFunction)=>{
            try {
                /******* authorization */
                if(request.jwt.role!="doctor")
                 next(new Error("Not Authorized..:)"));
                 request.body.payment={
                    method:request.body.method,
                    details:{paid:request.body.paid,
                            //  late:request.body.late
                            }
                 }
                 request.body.deliverInfo={address:request.body.address}

                 let cartProducts:any;
                //get products from cart 

                this._doctorService._populate="cart.products.id";
                this._doctorService._select={stockAmount:1,unitPrice:1,"images.url":1}
                if(request.jwt.role=="doctor")
                cartProducts=await this._doctorService.findOneById(new mongoose.Types.ObjectId(request.jwt.id),"cart")
              
                //what if the cart is empty
                if(cartProducts.cart.products.length==0)
                throw new Error("there are no products inside cart ....");
                 cartProducts.cart.products.forEach((product:any,index:any)=>{
                    if(product.id==null)
                    cartProducts.cart.products.splice(index,1) //to remove deleted products
                    // throw new Error(" some products are no longer exist");
                 })
                // // body should contains selected address to add on deliverInfo.address
                // //first return only array of products Ids
                // let productsIds=request.body.products.map((element:any)=>element.id);
                // //now get their stockAmount from DB
                // // let products:any = await this._productsService.findAll({_id:{$in:productsIds}},"stockAmount");
                
                let totalPrice=cartProducts.cart.products.reduce((current:any,product:any)=>current+(product.quantity*product.id.unitPrice),0)
                
                cartProducts.cart.products.forEach((element:any) => {
                        //search for stock amount then add it to their element of  array
                        // let matchedProduct=request.body.products.find((product:any)=> product.id==element._id);
                        // if(element.stockAmount<matchedProduct.quantity)
                        if(element.id.stockAmount<element.quanity)
                        throw new Error("some products are out of stock now");
                    });

                //check if the payment values are correct inserted before update products and insert new order
                // console.log(totalPrice,request.body.payment.details.paid)
                if(request.body.method=="cash")
                {
                    if(totalPrice!=request.body.paid)
                    {
                        throw new Error("paid value for cash should be equal total price "+totalPrice)
                    }
                }
                else if(request.body.method=="credit")
                {
                    if(totalPrice<request.body.paid)
                    {
                        throw new Error("paid value for credit should be <= total price")
                    }
                }
                else
                throw new Error("wrong payment method");
                //  //1- update stock amounts for theses products (decrement them)
                let updateProducts=cartProducts.cart.products.map((element:any)=>{
                    return { id: element.id._id,
                            unitPrice:element.id.unitPrice,
                            quantity:element.quantity}
                })
                let updates=await this._productsService.bulkWriteDec(updateProducts);
                // //2- add order to database   
                request.body.products=updateProducts;
                request.body.userId=request.jwt.id;
                let data=await this._serviceObj.createOne(request.body);
                //3- clean doctor cart 
                let cleanDoctorCart=await this._doctorService.updateOnewithCondition({_id:request.body.userId},{
                    $set:{"cart.products":[]}
                });
                // response.status(200).json({cartProducts,totalPrice});
                response.status(200).json(data);
            } catch (error) {
                next(error);
            }
       }
       /**  Done
        *  remove product from order
        * @param request 
        * @param response 
        * @param next 
        */
        removeProductForDoctorOrder=async (request:any,response:Response,next:NextFunction)=>{

        try {
            
                //1-  get product data from the order to change the correct quantity
                let order:any=await this._serviceObj.findOneById(request.body.orderId,"");//"userId products totalPrice");
                
                if(order.orderStatus!="pending")
                throw new Error("Can't update this order, the order is "+order.orderStatus);

                /******* authorization */
                if(request.jwt.id!=order.userId && request.jwt.role=="doctor" || request.jwt.role=="admin")
                 next(new Error("Not Authorized"));

                let deletedProduct=order?.products.find((product:any)=> product.id==request.body.productId)
                
                if(deletedProduct==undefined)
                throw new Error("prduct doesn't exists in userOrder ");

                let updatedDecrementPrice=deletedProduct.unitPrice*deletedProduct.quantity;
                //2- incraes stock amount by quantity for that product in products
                let stockAmountUpdates=await this._productsService.updateOnewithCondition({_id:request.body.productId},{
                    $inc:{stockAmount:deletedProduct.quantity}
                });
                //2- change payment details (from another route) and total price depending on qunatity
                //then remove it from array 
                let orderUpdates=await this._serviceObj.updateOnewithCondition({_id:request.body.orderId},{
                        $inc:{totalPrice:(-updatedDecrementPrice)},
                        $pull:{products:{id:request.body.productId}}
                });
                if(order.payment.details.method=="cash")
                {
                    orderUpdates=await this._serviceObj.updateOnewithCondition({_id:request.body.orderId},{
                        $inc:{"payment.details.paid":(-updatedDecrementPrice)}
                       
                });
                }
                 order=await this._serviceObj.findOneById(request.body.orderId,"");//"userId products totalPrice");
                
                response.status(200).json(order);
        } catch (error) {
            next(error);
        }
        }
        /**DONE
         * change  doctor order status to cancel
         * @param request 
         * @param response 
         * @param next 
         */
        cancelOrderForDoctor=async (request:any,response:Response,next:NextFunction)=>{
            try {
                        //1- add all qunatities for all products to products 
                        let order:any=await this._serviceObj.findOneById(request.body.orderId,"products userId orderStatus");
                        if(order==null)
                        next(new Error("this order doesn't exists"))
                        /******* authorization */
                        
                        if(request.jwt.id+""!=order.userId+"")
                        {
                            if(request.jwt.role!="admin")
                            next(new Error("Not Authorized .."));

                        }
                        
                        if(order.orderStatus=="delivered")
                        throw new Error("Can't cancell this order becuase it's already has been delivered");
                        if(order.orderStatus=="shipped")
                        throw new Error("Can't cancell this order becuase it's already has been shipped");
                        if(order.orderStatus=="cancelled")
                        throw new Error("Can't cancell this order becuase it's already has been cancelled");
                        let updateStockAmount=await this._productsService.bulkWriteInc(order.products);

                        //2- change order status to cancelled if the status is not delivered or shipped
                        let updateOrderStatus=await this._serviceObj.updateOne(request.body.orderId,{
                            $set:{orderStatus:"cancelled"}
                        });
                        order.orderStatus="cancelled";
                        response.status(200).json(order);
            } catch (error) {
                next(error);
            }
        }
         /**DONE
         * change  doctor order status to deliver
         * @param request 
         * @param response 
         * @param next 
         */
          deliverOrderForDoctor=async (request:any,response:Response,next:NextFunction)=>{
            try {
                        if(request.jwt.role!="doctor")
                        {
                            if(request.jwt.role!="admin")
                            next(new Error("Not Authorized .."));

                        }
                        //2- change order status to cancelled
                        let updateOrderStatus=await this._serviceObj.updateOnewithCondition(
                            {_id:request.body.orderId, orderStatus:{$nin:["cancelled","delivered"]}},
                            { $set:{orderStatus:"delivered"} });
                        let orderDetails:any=await this._serviceObj.findOneById(new mongoose.Types.ObjectId(request.body.orderId),"");//"userId products totalPrice orderStatus payment");   
                        response.status(200).json(orderDetails);
            } catch (error) {
                next(error);
            }
        }
      
        /**Done
        * get orderPayments for specified order
        * @param request 
        * @param response 
        * @param next 
        */
         getOrderPayment=async (request:any,response:Response,next:NextFunction)=>{
            try {
            //1- get total price for order and userId for that order
            let order:any=await this._serviceObj.findOneById(new mongoose.Types.ObjectId(request.params.orderid),"payment totalPrice userId")
            if(order==null)
            next(new Error("this order doesn't exists"))
            /******* authorization */
            if(request.jwt.id!=order.userId && request.jwt.role!="doctor" )
            {
                if(request.jwt.role!="admin")
                next(new Error("Not Authorized"));
            }
             

            //2- get late values for userId for all previous orders
            let latePaid=await this._serviceObj.findAllAggregate([
                {$match:{userId:order.userId,
                 "payment.details.late":{$ne:0},"orderStatus":{$nin:["cancelled"]}}},
                 {$group:{_id:"$userId",lateMoney:{$sum:"$payment.details.late"}}}
            ]);
            
           
                response.status(200).json({totalPrice:order.totalPrice,latePaid:latePaid[0]?.lateMoney});
            } catch (error) {
                next(error);
            }
    }
        /**Done
        * update orderPayments for specified order
        * @param request 
        * @param response 
        * @param next 
        */
        updateOrderPayment=async (request:any,response:Response,next:NextFunction)=>{
                try {
                
                     /******* authorization */
                    if(request.jwt.role!="doctor" )
                    {
                        if(request.jwt.role!="admin")
                        next(new Error("Not Authorized"));
                    }
                    let order:any=await this._serviceObj.findOneById(new mongoose.Types.ObjectId(request.body.id),"totalPrice");
                    if(order==null)
                    throw new Error(" no such an order ");
                  
                   
                    //not delivered or cancelled 
                    //  if cash  the the moeny should be == total price
                    //else <= total price and we will calcaulte the late money for him
                  let data=null;

                    if(request.body.method=="cash")
                    {
                        if(order.totalPrice!=request.body.paid)
                            throw new Error("your payment doesn't equal total price .! ");

                         data=await this._serviceObj.updateOnewithCondition(
                            {
                                _id:request.body.id,
                                userId:request.jwt.id,
                               // totalPrice:{$eq:request.body.paid},
                                orderStatus:{$nin:["delivered","cancelled"]}
                            },
                            {
                                $set:{  $set:{"payment.method":request.body.method,
                                "payment.details.paid":request.body.paid,
                                 "payment.details.late":0}}
                            });
                          
                        if(data.modifiedCount==0)
                        throw new Error("payment not completed either totalPrice not equal paid value or ordersatatus is not compitable or mybe you've already paid for that order");
                    }
                    else if(request.body.method=="credit")
                    {
                        if(order.totalPrice<request.body.paid)
                        throw new Error("your payment excceeds the total price for your order .! ");
    
                     data=await this._serviceObj.updateOnewithCondition(
                            {
                                _id:new mongoose.Types.ObjectId( request.body.id),
                                userId:new mongoose.Types.ObjectId(request.jwt.id),
                              // totalPrice:{$gte:request.body.paid},
                                orderStatus:{$nin:["delivered","cancelled"]}
                            },
                            {
                                $set:{"payment.method":request.body.method,
                                "payment.details.paid":request.body.paid,
                                 "payment.details.late":(order.totalPrice-request.body.paid)}
                            }
                        );
                      console.log(order.totalPrice-request.body.paid);
                      console.log(order);
                        if(data.modifiedCount==0)
                        throw new Error("payment not completed either totalPrice not > paid value or orderStatus is not compitable");

                    }
                    
                    response.status(200).json(data)
                     
                } catch (error) {
                    next(error);
                }
        }
       
       /**DONE
        * update order for doctor  when user clickd update order and after 
        * change some quantities for some orders
        * @param request 
        * @param response 
        * @param next 
        */
    updateOrderProductsForDoctor=async(request:any,response:Response,next:NextFunction)=>{
         /************************* note you will need to check the default update of the total price */
        try {
                //change quantity  for specidfied product --> cahnge that on stcok amount for that product
                //total price and payment will also changed
                
                
                //1- get orderdetails from DB
                this._serviceObj._populate="products.id";
                this._serviceObj._select={stockAmount:1};
                let order:any=await this._serviceObj.findOneById(request.body.orderId,"");//"userId orderStatus products");

               
                 /******* authorization */
                 if(request.jwt.id!=order.userId && request.jwt.role=="doctor" || request.jwt.role=="admin")
                 next(new Error("Not Authorized"));

                if(order?.orderStatus!="pending")
                throw new Error("Can't change order , order status has changed..");
                
                //2- update products in db for that order
                 let updateOrder=await this._serviceObj.bulkWriteOrder(request.body.orderId,request.body.products);
                console.log("order",order);
                console.log("order products",order.products);
                 //3- compare between current and Db to cahnge stock amount correctly
                 let totalPrice=0;
                request.body.products.forEach((element:any)=>{
                    //    let  dbProduct=order.products.find((product:any)=>product.id==element.id) before poupltae
                       let  dbProduct=order.products.find((product:any)=>product.id._id==element.id)
                       
                       //check if that product is out of stock or not
                       if(dbProduct.id.stockAmount<element.quantity)
                       throw new Error("some products are out of stock now ..");
                       //calculate the new total price
                       console.log(element.quantity,dbProduct.unitPrice);
                       totalPrice+=(element.quantity*dbProduct.unitPrice);
                       
                       //define the correct current quantity
                       let value=dbProduct.quantity-element.quantity;
                       console.log(element,"quantity",dbProduct.quantity,element.quantity);
                       element.quantity=value;
                });
                
                //4- now update stock amount with new values
                let updateProducts=await this._productsService.bulkWriteInc(request.body.products);

                //5- update total price for order

                await this._serviceObj.updateOnewithCondition({_id:request.body.orderId},{$set:{totalPrice:totalPrice}})
                //get stock amount for these products 
                response.status(200).json(order);
        } catch (error) {
            next(error);
        }
    
       }
       

        /**
         * /orders/doctor/track/:orderIds    return status and deliver Info         * 
         * @param request 
         * @param response 
         * @param next 
         */
     tarckOrderForDoctor=async(request:any,response:Response,next:NextFunction)=>{
        try {
            let order:any=await this._serviceObj.findOneById(
                new mongoose.Types.ObjectId(request.params.orderid),"");//"orderStatus payment deliverInfo");
            if(order==null)
            next(new Error("this order doesn't exists"))
                /******* authorization */
            if(request.jwt.id!=order.userId )
            {
                if (request.jwt.role!="admin")
                next(new Error("Not Authorized"));
            }
               

                response.status(200).json(order);
        } catch (error) {
            next(error);
        }
    }
        /**
         * /orders/doctor/cahngeAddress
         * change order address
         */
    
    /*********************** admin part ************************/
    /**
     * delete order from db by id
     * @param request 
     * @param response 
     * @param next 
     */
    deletOrder=async (request:Request,response:Response,next:NextFunction)=>{
        try {
                //delete order if it cancelled or delivered  
                let data=await this._serviceObj.deleteOnebyCondition({_id:request.body.orderId,orderStatus:{$in:["cancelled"]}})
                if(data.deletedCount==0)
                throw new Error("can't delete order make sure either Order exists or it's status is cancelled")

                response.status(200).json({message:"deleted"});

        } catch (error) {
          next(error);
        }

   }
/**
     * get all orders by status --> using pagaination
     * @param request 
     * @param response 
     * @param next 
     */
    getOrderByStatus=async (request:Request,response:Response,next:NextFunction)=>{
    try {
            //delete order  
            this._serviceObj._populate="userId",
            this._serviceObj._select="fullName"
            let data=await this._serviceObj.findAll({orderStatus:request.params.status},"",+request.params.page|1);
            response.status(200).json(data);

    } catch (error) {
      next(error);
    }

}

        /**
         * /orders/admin/updatetrack    return status and deliver Info         * 
         * @param request 
         * @param response 
         * @param next 
         */
         updateTarckOrder=async(request:Request,response:Response,next:NextFunction)=>{
            try {
                let order:any=await this._serviceObj.updateOnewithCondition(
                   {_id:new mongoose.Types.ObjectId(request.body.orderId)},{
                    $set:{
                        "deliverInfo.date":request.body.date, // month/day/year   schemaand input validation
                        "deliverInfo.time":request.body.time,
                        "deliverInfo.address":request.body.address
                        // "deliverInfo.flyBoy":request.body.flyBoy

                    }
                   });
                response.status(200).json(order);
            } catch (error) {
                next(error);
            }
        }
 
        /**
         * /orders/admin/shippOrder    return status and deliver Info         * 
         * @param request 
         * @param response 
         * @param next 
         */
        shipOrder=async(request:Request,response:Response,next:NextFunction)=>{
        try {
            let order:any=await this._serviceObj.updateOnewithCondition(
            {_id:new mongoose.Types.ObjectId(request.body.orderId),orderStatus:"pending"},{
                $set:{
                    orderStatus:"shipped",
                    "deliverInfo.date":request.body.date, // month/day/year
                    "deliverInfo.time":request.body.time,
                    //"deliverInfo.address":request.body.address,
                    // "deliverInfo.flyBoy":request.body.flyBoy
                }
            });
            response.status(200).json(order);
        } catch (error) {
            next(error);
        }
}

        /**
         * /orders/admin/searchDate/:from/:to    return status and deliver Info         * 
         * @param request 
         * @param response 
         * @param next 
         */
         searchOrdersBydate=async(request:Request,response:Response,next:NextFunction)=>{
            try {

                //1- first get from and to , convert them to Dateobjects
                let fromDate=new Date(request.params.from);
                let toDate=new Date(request.params.to);
                // console.log("Dates ",request.params.from,request.params.to);
                // console.log("Dates ",fromDate.toDateString(),toDate.toDateString());
                if(fromDate>toDate)
                throw new Error("fromDate should be before toDate");

                if(toDate.getFullYear()-fromDate.getFullYear()>1)
                throw new Error("you can search within one year only");

                const dates = [];

                while (fromDate <= toDate) {
                    dates.push(new Date(fromDate).toLocaleString().split(",")[0]);
                    fromDate.setDate(fromDate.getDate() + 1);
                  }

                 let data=await this._serviceObj.findAll(
                    {orderDate:{$in:dates},orderStatus:request.params.status},"",+request.params.page);
                 response.status(200).json(data);
            } catch (error) {
                next(error);
            }
        }

/**
 * 
 * @param request 
 * @param response 
 * @param next 
 */
        getBalancePdf=async (request: any, response: Response, next: NextFunction) => {

            try{
              
                // let data=await this._serviceObj.findAll({"payment.method":"credit",
                //     "payment.details.late":{$eq:0},userId:new mongoose.Types.ObjectId('6297569b20d6074daaf83321')
                // },"orderDate payment.details.late userId",1,200);
                let calculatedDayesInMonth=calculateCurrentDate();
                let dates=calculatedDayesInMonth.dates;
                let data=await this._serviceObj.findAllAggregate([
                    {$match:{userId:new mongoose.Types.ObjectId(request.jwt.id),"payment.method":"credit","payment.details.late":{$ne:0},
                     "orderStatus":{$nin:["cancelled"]},orderDate:{$in:dates}}},
                     {$project:{orderDate:1,"payments":"$payment.details.paid",lateMoney:"$payment.details.late",_id:0}}
                ],1,200);
                let doctor:any=await this._doctorService.findOneById(new mongoose.Types.ObjectId(request.jwt.id),"balance");
                let info:any={};
                info.balance=doctor.balance;
                info.currentMonth=calculatedDayesInMonth.currentMonth;
                request.data=data;
                request.info=info;
                next();
            }
            catch(error)
            {
              next(error);
            }
          }
          getBalancehtml=async (request: any, response: Response, next: NextFunction) => {

            try{
              
                let calculatedDayesInMonth=calculateCurrentDate();
                let dates=calculatedDayesInMonth.dates;
                let orders:any=await this._serviceObj.findAllAggregate([
                    {$match:{userId:new mongoose.Types.ObjectId(request.jwt.id),
                     "payment.method":"credit","payment.details.late":{$ne:0},
                     "orderStatus":{$nin:["cancelled"]},orderDate:{$in:dates}}},
                
                     {$project:{orderDate:1,"payments":"$payment.details.paid",lateMoney:"$payment.details.late",_id:1}}
                ],1,200);
            
                let doctor:any=await this._doctorService.findOneById(new mongoose.Types.ObjectId(request.jwt.id),"balance");
                let data:any={};
                data.balance=doctor.balance;
                data.currentMonth=calculatedDayesInMonth.currentMonth;
                data.token=request.token;
                data.orders=orders;
                request.data=data;
                console.log(data);
                
                
                next();
            }
            catch(error)
            {
              next(error);
            }
          }
 
}
