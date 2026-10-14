import { DoctorController } from "./../controllers/doctor.controller";
import express =require("express");
import {body,param} from "express-validator"
import { JwtClass } from "./../middelwraes/auth.middleware";
import {InputValidation} from "./../middelwraes/validation.middleware";

let _doctorController=new DoctorController();
const router=express.Router();

/****************************************************
 * validators
 */
let changePasswordValidator=[
    body("id").notEmpty().withMessage("user key is required")
              .isMongoId().withMessage("user key is not valid")
              
              ,body("oldPassword").notEmpty().withMessage("old password is required")
              //.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/).withMessage("phone number is not valid")                
              
              ,body("newPassword").notEmpty().withMessage("new password is required")
                         //.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,1024}$/).withMessage("phone number is not valid")                
                         .custom((value,{req}) =>{
                            
                            if(value === req.body.oldPassword){
                                throw new Error('old password and new password are the same')
                            }
                            return true;
                        })
]

let searchValidator=[param("value").optional().default("")
                    .isString().withMessage("search should be string")];
let idValidator=[param("id").isMongoId().withMessage("wrong id value")];

let addproductValidator=[
  //  body("id").isMongoId().withMessage("id value is incorrect"),
    body("product").isMongoId().withMessage("id value is incorrect"),
    body("quantity").optional().isNumeric().withMessage("quantity should be number").default(0)
]
let addressValidator=[
    body("address").isObject().withMessage("address should be object"),
    body("address.addressName").isString().withMessage("addressName should be string"),
    body("address.governorate").isString().withMessage("governorate should be string"),
    body("address.city").isString().withMessage("city should be string"),
    body("address.street").isInt().withMessage("street should be number"),
    body("address.building").isInt().withMessage("building should be number"),
    body("address.details").optional().isString().withMessage("details should be string")
];

/*************************************************** */

router.use(JwtClass.checkJwt);
const checkUser=((request:any,response:any,next:any)=>{
        console.log(request.jwt)
            if(request.jwt.role=="doctor"|| request.jwt.role=="admin")
            next();
            else
            next(new Error("Un Authorized"));

});
const checkAdmin=((request:any,response:any,next:any)=>{
        
    if(request.jwt.role=="admin")
    next();
    else
    next(new Error("Un Authorized"));

});

const checkDoctor=function(request:any,response:any,next:any)
{
    if(request.body.id!=request.jwt.id) next(new Error("not Authorized"));
    else
    next();   
}

router.post("/changePassword",
                    checkDoctor,
                    changePasswordValidator,
                    InputValidation.basicValidate,
                    checkDoctor,
                    _doctorController.changePassword);




router.get("/suggestname/:value?",checkAdmin,
            searchValidator,InputValidation.basicValidate,
            _doctorController.autoCompleteSearchByFullName);
router.get("/suggestphone/:value?",checkAdmin,
            searchValidator,InputValidation.basicValidate,
            _doctorController.autoCompleteSearchByPhoneNumber);




router.put("/addcart",
addproductValidator,InputValidation.basicValidate,

_doctorController.addToCart);

router.put("/removecart",
addproductValidator,InputValidation.basicValidate,
_doctorController.removeFromCart);

router.get("/cart",
_doctorController.getCartProducts);

router.put("/addwish",
addproductValidator,InputValidation.basicValidate,
_doctorController.addToWishList);

router.put("/removewish",
addproductValidator,InputValidation.basicValidate,
_doctorController.removeFromWishList);

router.get("/wish",
_doctorController.getWishProducts)

router.get("/profile",_doctorController.getProfile);

router.put("/newAddress",
addressValidator,
InputValidation.basicValidate,
_doctorController.doctorNewAddress
);

export default router;
