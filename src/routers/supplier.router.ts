import { SupplierController } from "../controllers/supplier.controller";
import express =require("express");
import {body, param} from "express-validator"
// import { JwtClass } from "./../middelwraes/auth.middleware";
import {InputValidation} from "../middelwraes/validation.middleware";
import { JwtClass } from "./../middelwraes/auth.middleware";

let _supplierController=new SupplierController();
const router=express.Router();

/****************** validators */
let createValidator=[
    body("fullName").notEmpty().withMessage("full name is required")
                    .isString().withMessage("fullName should be charachters")
                    // .isLength({min:20}).withMessage("please enter your full name min 20 cahrachters")
    ,body("phoneNumber").notEmpty().withMessage("phone number is required")
                        .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/).withMessage("phone number is not valid")                
    
    ,body("whatsAppNumber").notEmpty().withMessage("whatsApp number is required")
                           .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/).withMessage("whatsApp number is not valid")                  
    ,body("email").optional().isEmail().withMessage("wrong email "),
    body("addresses").optional().isArray().withMessage("wrong address array"),
    body("addresses.*").isObject().withMessage("address should be object"),
    body("addresses.*.addressName").optional().isString().withMessage("addressName should be string"),
    body("addresses.*.governorate").optional().isAlpha().withMessage("governorate should be string"),
    body("addresses.*.city").optional().isAlpha().withMessage("city should be string"),
    body("addresses.*.street").optional().isString().withMessage("street should be string"),
    body("addresses.*.building").optional().isString().withMessage("building should be string"),
    body("addresses.*.details").optional().isString().withMessage("details should be string")
];
let updateValidator=[
    body("id").isMongoId().withMessage("wrong id value"),
    body("fullName").optional()
                    .isString().withMessage("fullnmae should be charachters")
                    // .isLength({min:20}).withMessage("please enter your full name min 20 cahrachters")
    ,body("phoneNumber").optional()
                        .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/).withMessage("phone number is not valid")                
    
    ,body("whatsAppNumber").optional()
                           .matches(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}$/).withMessage("whatsApp number is not valid")                  
    ,body("email").optional().isEmail().withMessage("wrong email "),

];
let productsValidator=[
    body("products").optional().isArray().withMessage("products should be array"),
    
    body("products.*").optional().isMongoId().withMessage(" id is not valid"),
    body("product").optional().isMongoId().withMessage(" id is not valid"),

]

let medicineValidator=[
    body("medicines").optional().isArray().withMessage("medicines should be array"),
    body("medicines.*").optional().isMongoId().withMessage("id is not valid") ,
    body("medicine").optional().isMongoId().withMessage("id is not valid") ];
let addressValidator=[
    body("addresse").optional().isObject().withMessage("address should be object"),
    body("addresse.addressName").optional().isString().withMessage("addressName should be string"),
    body("addresse.governorate").optional().isAlpha().withMessage("governorate should be string"),
    body("addresse.city").optional().isAlpha().withMessage("city should be string"),
    body("addresse.street").optional().isString().withMessage("street should be string"),
    body("addresse.building").optional().isInt().withMessage("building should be number"),
    body("addresse.details").optional().isString().withMessage("details should be string")
]


let deleteValidator=[
    body("id").isMongoId().withMessage("wrong id value")
]

let idValidator=[
    param("id").isMongoId().withMessage("wrong id value")
]
/**************
 * Authorization
 */
 router.use(JwtClass.checkJwt);
 router.use((request:any,response,next)=>{
             if(request.jwt.role=="admin")
             next();
             else
             next(new Error("Un Authorized"));
 
 });
 
 

/**************************************** */
router.route("")
    .get(_supplierController.getAll)
    .post(createValidator,
        InputValidation.basicValidate,
        _supplierController.createSuppleir)
    .put(updateValidator,
        InputValidation.basicValidate,
        _supplierController.updateSupplier)
    .delete(deleteValidator,
        InputValidation.basicValidate,
        _supplierController.delete)
        router.route("/:id")
.get(idValidator,
    InputValidation.basicValidate,
    _supplierController.getOneById)

router.put("/addproduct",
            productsValidator,InputValidation.basicValidate,
            _supplierController.addProducts);
router.put("/removeproduct",
            productsValidator,InputValidation.basicValidate,            
            _supplierController.removeProduct);
router.put("/addmedicine",
            medicineValidator,InputValidation.basicValidate,
            _supplierController.addMedicines);
router.put("/removemedicine",
            medicineValidator,InputValidation.basicValidate,
            _supplierController.removeMedicine);
router.put("/addaddress",
            addressValidator,InputValidation.basicValidate,
            _supplierController.addAddress);
router.put("/removeaddress",
            addressValidator,InputValidation.basicValidate,
            _supplierController.removeAddress);








export default router;
