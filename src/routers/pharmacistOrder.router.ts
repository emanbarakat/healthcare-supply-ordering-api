import {  PharmacistOrderController } from "../controllers/pharmacistOrder.controller";
import express =require("express");
import {body, param} from "express-validator"
import {InputValidation} from "../middelwraes/validation.middleware";
import { JwtClass } from "./../middelwraes/auth.middleware";

let _orderController=new PharmacistOrderController();
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
  
 const checkPharmacist=function(request:any,response:any,next:any)
 {
     if(request.jwt.role!="pharmacist") next(new Error("not Authorized"));
     else
     next();   
 }
 const checkPharmacistAdmin=function(request:any,response:any,next:any)
 {
    console.log(request.jwt.role!="pharmacist" && request.jwt.role!="admin")
     if(request.jwt.role!="pharmacist" && request.jwt.role!="admin") next(new Error("not Authorized"));
     else
     next();   
 }

/***************************** for mobile *********************/
//  on doctor and pharmasist routes

//done
router.get("/pharmacist/confirmOrder",checkPharmacist
,_orderController.confirmOrderForDoctor);

//done
router.post("/pharmacist/add",checkPharmacist,
[ 
    body("method").isIn(["cash","credit"]).withMessage("wrong payemnt method"),
    body("paid").isNumeric().withMessage("payment details paid should be number")  
],addressValidator, InputValidation.basicValidate,
_orderController.addOrderToDoctor);//confirm order

//done
router.get("/pharmacist/orderDetails/:orderid",checkPharmacist,
oredrIdValidator,InputValidation.basicValidate,
_orderController.getOrderDetailsForDoctor);

//done
router.get("/pharmacist/all/:page?",checkPharmacistAdmin,
pageParamValidator,InputValidation.basicValidate
,_orderController.getAllOrders);

//to get currently late paid money with order details
router.get("/pharmacist/paymentDetails/:orderid",checkPharmacistAdmin,
oredrIdValidator,InputValidation.basicValidate,
_orderController.getOrderPayment);

//done
router.get("/pharmacist/trackOrder/:orderid",
oredrIdValidator,InputValidation.basicValidate,checkPharmacistAdmin,
_orderController.tarckOrderForDoctor);

//done
router.put("/pharmacist/updatepayment",checkPharmacistAdmin,
[
    body("id").isMongoId().withMessage("wrong id value"),
    body("method").isIn(["cash","credit"]).withMessage("method sgould be cash or credit"),
    body("paid").isNumeric().withMessage("paid should be number")    
],InputValidation.basicValidate,
_orderController.updateOrderPayment);


router.put("/pharmacist/cancelOrder",checkPharmacistAdmin,
[
    body("orderId").isMongoId().withMessage("wrong id value")       
],InputValidation.basicValidate,
_orderController.cancelOrderForDoctor);

router.put("/pharmacist/deliverOrder",checkPharmacistAdmin,
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

// router.get('/doctor/balancehtml' ,_orderController.getBalancehtml,function (req:any, res, next) {

//         res.status(200).json({data:htmlMW.create(req.data)})
    
//      });
// router.get('/doctor/balance',_orderController.getBalancePdf ,function (req:any, res, next) {
//     // res.setHeader('Content-type', 'application/pdf');
//     var pdf = pdfMW.create(req.data);
//     pdf.pipe(res);
//     pdf.end();
//  });
// router.get("/pharmacist/balancepdf",(req:any,res:any,next:any)=>{
//     res.setHeader('Content-type', 'text/html');
//     res.send(Buffer.from('<html><body><a href="https://fathomless-hollows-91408.herokuapp.com/orders/doctor/balance" download>PDF<a></body></html>'));

// })
export default router;
