import { PharmacistController } from "../controllers/pharmacist.controller";
import express =require("express");
import {body, param} from "express-validator"
import { JwtClass } from "./../middelwraes/auth.middleware";
import {InputValidation} from "../middelwraes/validation.middleware";
let _pharmacistController=new PharmacistController();

const router=express.Router();
   

/******************************************************
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
];
let searchValidator=[param("value").optional().default("")
                    .isString().withMessage("search should be string")]

let addproductValidator=[
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
/********************** authorization************************* */
router.use(JwtClass.checkJwt);
const checkAdmin=((request:any,response:any,next:any)=>{
        
    if(request.jwt.role=="admin")
    next();
    else
    next(new Error("Un Authorized"));

});
const checkPharmacist=function(request:any,response:any,next:any)
{
    if(request.jwt.role!="pharmacist") next(new Error("not Authorized"));
    else
    next();   
}
/*********************************
 * Routes
 */
router.post("/changePassword",
                checkPharmacist,
                changePasswordValidator,
                InputValidation.validate,
                _pharmacistController.changePassword);

router.get("/suggestname",
            checkAdmin,
            searchValidator,
            _pharmacistController.autoCompleteSearchByFullName);
router.get("/suggestphone",
                checkAdmin,
                searchValidator,
                _pharmacistController.autoCompleteSearchByPhoneNumber);


//add accessory and medicine to cart
router.put("/addacart",checkPharmacist, addproductValidator,InputValidation.basicValidate,

_pharmacistController.addAccessoryToCart);

router.put("/addmcart",checkPharmacist, addproductValidator,InputValidation.basicValidate,

_pharmacistController.addMedicineToCart);


//get all cart products
router.get("/cart",checkPharmacist,
_pharmacistController.getCartProducts);

router.put("/removecart",checkPharmacist,
addproductValidator,InputValidation.basicValidate,
_pharmacistController.removeFromCart);


router.put("/addmwish",checkPharmacist,
addproductValidator,InputValidation.basicValidate,
_pharmacistController.addMedicineToWishList);

router.put("/addawish",checkPharmacist,
addproductValidator,InputValidation.basicValidate,
_pharmacistController.addAccessoryToWishList);

router.put("/removewish",checkPharmacist,
addproductValidator,InputValidation.basicValidate,
_pharmacistController.removeFromWishList);

router.get("/wish",
_pharmacistController.getWishProducts)

router.get("/profile",_pharmacistController.getProfile);

router.put("/newAddress",
addressValidator,
InputValidation.basicValidate,
_pharmacistController.doctorNewAddress
);
                
export default router;
