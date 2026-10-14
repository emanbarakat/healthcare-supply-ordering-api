import { FlyBoyController } from "./../controllers/flyBoy.controller";
import { AdminController } from "./../controllers/admin.controller";
import { JwtClass } from "./../middelwraes/auth.middleware";
import express =require("express");
import {body, param} from "express-validator";
import {InputValidation} from "./../middelwraes/validation.middleware";
import { OrderController } from "../controllers/order.controller";
import { PharmacistOrderController } from "../controllers/pharmacistOrder.controller";


let _adminController=new AdminController();
let _flyBoyController=new FlyBoyController();
let _orderController=new OrderController();
let _phatmacistOrderController=new PharmacistOrderController();
// let _doctorController=new DoctorController();
const adminRouter=express.Router();


adminRouter.use(JwtClass.checkJwt);
function checkAdmin(request:any,response:any,next:any){
    console.log("admin router",request.url,request.method,request.jwt);
    if(request.jwt.role=="admin"||request.jwt.role=="subAdmin")
    next();
    else
    next(new Error("Not Authorized...."));
};
function checkMainAdminOnly(request:any,response:any,next:any){
    console.log("admin router",request.url,request.method,request.jwt);
    if(request.jwt.role=="admin")
    next();
    else
    next(new Error("Not Authorized...."));
};

/**   
 * page validator array 
 **/
let pageParamValidator=[
    param("page").optional().default("1").isInt().withMessage("page number should be integer")
];
let oredrIdValidator=[
    body("orderId").isMongoId().withMessage("wrong orderId value")
];
let statusValidator=[
    param("status").isIn(["pending","shipped","delivered","cancelled"]).withMessage(`status should be "pending","delivered",shipped,"cancelled"`)
];
let serachDateValidator=[
    param("from").matches(/^(1[0-2]|0?[1-9])-(3[01]|[12][0-9]|0?[1-9])-(?:[0-9]{2})?[0-9]{2}$/gm).withMessage("date  from formate MM-DD-YY")
    ,param("to").matches(/^(1[0-2]|0?[1-9])-(3[01]|[12][0-9]|0?[1-9])-(?:[0-9]{2})?[0-9]{2}$/gm).withMessage("date to formate MM-DD-YY")
];
let updateOrderInfoValidator=[
    body("date").matches(/^(1[0-2]|0?[1-9])\/(3[01]|[12][0-9]|0?[1-9])\/(?:[0-9]{2})?[0-9]{2}$/gm).withMessage("date formate MM/DD/YY"),
    body("time").matches(/^(0?[1-9]|1[0-2]):([0-5]\d)\s?((?:A|P)\.?M\.?)$/).withMessage("date formate HH:MM AM|PM"),
];
let addressValidator=[
    body("addresse").optional().isObject().withMessage("address should be object"),
    body("addresse.addressName").optional().isString().withMessage("addressName should be string"),
    body("addresse.governorate").optional().isAlpha().withMessage("governorate should be string"),
    body("addresse.city").optional().isString().withMessage("city should be string"),
    body("addresse.street").optional().isInt().withMessage("street should be number"),
    body("addresse.building").optional().isInt().withMessage("building should be number"),
    body("addresse.details").optional().isString().withMessage("details should be string")
]
/**********
 * Basic administrator routers
 */

adminRouter.put("/changestatus",
checkAdmin,_adminController.setUsersStatus);

adminRouter.get("/admin/:page?",
checkMainAdminOnly,
pageParamValidator,
InputValidation.validate,
_adminController.getAllAdmins);

adminRouter.post("/admin",checkMainAdminOnly,_adminController.createAdmin)
/***********  
 * Doctor Routers
 */
adminRouter.get("/doctor/getpending/:page?",checkAdmin,
pageParamValidator,
InputValidation.validate,
_adminController.getAllPendingDoctors);

adminRouter.get("/doctor/getblocked/:page?",checkAdmin,
pageParamValidator,
InputValidation.validate,
_adminController.getAllBlockedDoctors);

adminRouter.get("/doctor/:page?",checkAdmin,
pageParamValidator,
InputValidation.validate,
_adminController.getAllDoctors);

/***********  
 * Pharmacist Routers
 */
adminRouter.get("/pharmacist/getpending/:page?",checkAdmin,
pageParamValidator,
InputValidation.validate,
_adminController.getAllPendingPharmasists)


adminRouter.get("/pharmacist/getblocked/:page?",checkAdmin,
pageParamValidator,
InputValidation.validate,
_adminController.getAllBlockedPharmasists)

adminRouter.get("/pharmacist/:page?",checkAdmin,
pageParamValidator,
InputValidation.validate,
_adminController.getAllPharmasists);

/***********  
 * flyBoy Routers
 */

adminRouter.get("/flyboy/:page?",checkAdmin,
pageParamValidator,
InputValidation.validate,
_adminController.getAllFlyboys);

adminRouter.post("/flyBoy",checkAdmin,_flyBoyController.post);


/************
 * Orders for doctors
 */

//--doctor
adminRouter.delete("/orders/admin/remove",checkAdmin,
oredrIdValidator,InputValidation.basicValidate,
_orderController.deletOrder);



adminRouter.get("/orders/admin/ordersBystatus/:status/:page?",checkAdmin,
statusValidator,pageParamValidator,InputValidation.basicValidate,
_orderController.getOrderByStatus);


adminRouter.put("/orders/admin/updateTrack",checkAdmin,
oredrIdValidator,updateOrderInfoValidator,addressValidator,InputValidation.basicValidate,
_orderController.updateTarckOrder);

adminRouter.put("/orders/admin/shippOrder",checkAdmin,
oredrIdValidator,updateOrderInfoValidator,addressValidator,InputValidation.basicValidate,
_orderController.shipOrder);

adminRouter.put("/doctor/admin/newAddress",checkAdmin,
[body("doctorId").isMongoId().withMessage("wrong id value")],
addressValidator,InputValidation.basicValidate,
_adminController.doctorNewAddress)

adminRouter.get("/orders/admin/searchDate/:from/:to/:status/:page?",checkAdmin,
(request:any,resposne:any,next:any)=>{
    
    if(request.params.from.match(/^(1[0-2]|0?[1-9])-(3[01]|[12][0-9]|0?[1-9])-(?:[0-9]{2})?[0-9]{2}$/gm)==null)
    next(new Error("wrong from date format MM-DD-YY"));
    if(request.params.to.match(/^(1[0-2]|0?[1-9])-(3[01]|[12][0-9]|0?[1-9])-(?:[0-9]{2})?[0-9]{2}$/gm)==null)
    next(new Error("wrong to date format MM-DD-YY"));
   
    next()
},
pageParamValidator,statusValidator,InputValidation.basicValidate,
_orderController.searchOrdersBydate);

//update doctor balance
adminRouter.put("/doctor/admin/balance",checkAdmin,
[body("doctorId").isMongoId().withMessage("wrong id value"),
body("balance").isNumeric().withMessage("balance should be a number")],
InputValidation.basicValidate,
_adminController.doctorUpdateBalance)


/**************************************************/
/***
 * Orders for pharmacist
 */

adminRouter.delete("/pharmorders/admin/remove",checkAdmin,
oredrIdValidator,InputValidation.basicValidate,
_phatmacistOrderController.deletOrder);

adminRouter.get("/pharmorders/admin/ordersBystatus/:status/:page?",checkAdmin,
statusValidator,pageParamValidator,InputValidation.basicValidate,
_phatmacistOrderController.getOrderByStatus);


adminRouter.put("/pharmorders/admin/updateTrack",checkAdmin,
oredrIdValidator,updateOrderInfoValidator,addressValidator,InputValidation.basicValidate,
_phatmacistOrderController.updateTarckOrder);


adminRouter.put("/pharmorders/admin/shippOrder",checkAdmin,
oredrIdValidator,updateOrderInfoValidator,addressValidator,InputValidation.basicValidate,
_phatmacistOrderController.shipOrder);

adminRouter.put("/pharmacist/admin/newAddress",checkAdmin,
[body("doctorId").isMongoId().withMessage("wrong id value")],
addressValidator,InputValidation.basicValidate,
_adminController.doctorNewAddress)

adminRouter.put("/pharmacist/admin/balance",checkAdmin,
[body("doctorId").isMongoId().withMessage("wrong id value"),
body("balance").isNumeric().withMessage("balance should be a number")],
InputValidation.basicValidate,
_adminController.pharmacistUpdateBalance);

adminRouter.get("/pharmorders/admin/searchDate/:from/:to/:status/:page?",checkAdmin,
(request:any,resposne:any,next:any)=>{
    
    if(request.params.from.match(/^(1[0-2]|0?[1-9])-(3[01]|[12][0-9]|0?[1-9])-(?:[0-9]{2})?[0-9]{2}$/gm)==null)
    next(new Error("wrong from date format MM-DD-YY"));
    if(request.params.to.match(/^(1[0-2]|0?[1-9])-(3[01]|[12][0-9]|0?[1-9])-(?:[0-9]{2})?[0-9]{2}$/gm)==null)
    next(new Error("wrong to date format MM-DD-YY"));
   
    next()
},
pageParamValidator,statusValidator,InputValidation.basicValidate,
_phatmacistOrderController.searchOrdersBydate);

// update pharmacist Balance


export default adminRouter;
