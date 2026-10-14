import {  OrderController } from "../controllers/order.controller";
import express =require("express");
import {body, param} from "express-validator"
// import { JwtClass } from "./../middelwraes/auth.middleware";
import {InputValidation} from "../middelwraes/validation.middleware";
import { JwtClass } from "./../middelwraes/auth.middleware";

let _orderController=new OrderController();
const router=express.Router();

/*************
 * 
 * validators
 */
 let pageParamValidator=[
    param("page").optional().default("1").isInt().withMessage("page number should be integer")
];
let oredrIdValidator=[
    param("orderid").isMongoId().withMessage("wrong orderId value....")
];
let addressValidator=[
    body("address").isObject().withMessage("address should be object"),
    body("address.addressName").isString().withMessage("addressName should be string"),
    body("address.governorate").isString().withMessage("governorate should be string"),
    body("address.city").isString().withMessage("city should be string"),
    body("address.street").isInt().withMessage("street should be number"),
    body("address.building").isInt().withMessage("building should be number"),
    body("address.details").optional().isString().withMessage("details should be string")
];


/*****************************
 * Authorization
 */
 router.use(JwtClass.checkJwt);
//  s
 
 const checkDoctor=function(request:any,response:any,next:any)
 {
   
   
     if(request.body.id!=request.jwt.id) next(new Error("not Authorized"));
     else
     next();   
 }

/***************************** for mobile *********************/
//  on doctor and pharmasist routes

router.get("/doctor/confirmOrder"
,_orderController.confirmOrderForDoctor);




router.post("/doctor/add",
[ 
    body("method").isIn(["cash","credit"]).withMessage("wrong payemnt method"),
    body("paid").isNumeric().withMessage("payment details paid should be number")  
],addressValidator, InputValidation.basicValidate,
_orderController.addOrderToDoctor);//confirm order

router.get("/doctor/orderDetails/:orderid",
oredrIdValidator,InputValidation.basicValidate,
_orderController.getOrderDetailsForDoctor);


router.get("/doctor/all/:page?",
pageParamValidator,InputValidation.basicValidate
,_orderController.getAllOrders);

//to get currently late paid money with order details
router.get("/doctor/paymentDetails/:orderid",
oredrIdValidator,InputValidation.basicValidate,
_orderController.getOrderPayment);

router.get("/doctor/trackOrder/:orderid",
oredrIdValidator,InputValidation.basicValidate,
_orderController.tarckOrderForDoctor);

router.put("/doctor/updatepayment",
[
    body("id").isMongoId().withMessage("wrong id value"),
    // body("payment").isObject().withMessage("payment datatype incorrect"),
    body("method").isIn(["cash","credit"]).withMessage("method sgould be cash or credit"),
    // body("payment.details").isObject().withMessage("wrong details type"),
    body("paid").isNumeric().withMessage("paid should be number")    
],InputValidation.basicValidate,
_orderController.updateOrderPayment);


router.put("/doctor/cancelOrder",
[
    body("orderId").isMongoId().withMessage("wrong id value")       
],InputValidation.basicValidate,
_orderController.cancelOrderForDoctor);

router.put("/doctor/deliverOrder",
[
    body("orderId").isMongoId().withMessage("wrong id value")       
],InputValidation.basicValidate,
_orderController.deliverOrderForDoctor);


//get orders of the current Month





// router.put("/doctor/removeProduct",
// [
//     body("orderId").isMongoId().withMessage("wrong id value"),
//     body("productId").isMongoId().withMessage("wrong id value"),
       
// ],InputValidation.basicValidate,
// _orderController.removeProductForDoctorOrder);


//add products for order
// router.put("/doctor/updateProducts",
// [
//     body("orderId").isMongoId().withMessage("wrong id value"),
//     body("productId").isMongoId().withMessage("wrong product id value"),
//     body("quantity").isNumeric().withMessage("wrong product quantity should be number"),  
// ],InputValidation.basicValidate,
// _orderController.updateOrderProductsForDoctor);



/************ creatPDF with orders */
const pdfMW=require("./../middelwraes/pdf.middleware");
const htmlMW=require("./../middelwraes/html.middleware");

router.get('/doctor/balancehtml' ,_orderController.getBalancehtml,function (req:any, res, next) {
        res.status(200).json({data:htmlMW.create(req.data)})
    
     });
router.get('/doctor/balance',_orderController.getBalancePdf ,function (req:any, res, next) {
    // res.setHeader('Content-type', 'application/pdf');
    var pdf = pdfMW.create(req.data,req.info);
    pdf.pipe(res);
    pdf.end();
 });
router.get("/doctor/balancepdf",(req:any,res:any,next:any)=>{
    res.setHeader('Content-type', 'text/html');
    res.send(Buffer.from('<html><body><a href="https://fathomless-hollows-91408.herokuapp.com/orders/doctor/balance" download>PDF<a></body></html>'));

})
export default router;
