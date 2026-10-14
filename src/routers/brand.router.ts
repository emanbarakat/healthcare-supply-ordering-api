import { BrandController } from "../controllers/brand.controller";
import express =require("express");
import {body, param} from "express-validator"
// import { JwtClass } from "./../middelwraes/auth.middleware";
import {InputValidation} from "../middelwraes/validation.middleware";
import { JwtClass } from "./../middelwraes/auth.middleware";

let _brandController=new BrandController();
const router=express.Router();

let inputValidator=[
    body("name").isString().withMessage("brand name should be string")
]

let updateValidator=[
    body("id").isMongoId().withMessage("wrong id value"),
    body("name").optional().isString().withMessage("brand name should be string")
]

let getVlaidator=[
    param("id").isMongoId().withMessage("wrong id value")
]
router.use(JwtClass.checkJwt);
function checkAdmin(request:any,response:any,next:any){

    if(request.jwt.role=="admin"||request.jwt.role=="subAdmin")
    next();
    else
    next(new Error("Not Authorized"));
};
 
router.route("")
    .all(checkAdmin)
    .get(_brandController.getAll)
    .post(inputValidator,
        InputValidation.basicValidate,
        _brandController.createBrand)
    .put(updateValidator,
        InputValidation.basicValidate,
        _brandController.put)
    .delete(updateValidator,
        InputValidation.basicValidate,
        _brandController.delete)

router.route("/:id")
      .all(checkAdmin)
      .get(getVlaidator,
        InputValidation.basicValidate,
        _brandController.getOneById)






export default router;
