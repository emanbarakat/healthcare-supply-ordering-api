import { ProductController } from "../controllers/product.controller";
import express =require("express");
import {cloudinary} from "./../core/utils/cloudinary";
import {param,body} from "express-validator"
// import { JwtClass } from "./../middelwraes/auth.middleware";
import {InputValidation} from "../middelwraes/validation.middleware";
import { productFileFilter, productStorage ,limits} from "./../core/imagesConfig/productConfig";
import multer = require("multer");

import { ProductModel } from "./../models/product.model";
import { JwtClass } from "./../middelwraes/auth.middleware";
import { OrderModel } from "../models/order.model";

let _productController=new ProductController();
const router=express.Router();

/******** validators */
let idValidator=[
  param("id").isMongoId().withMessage("wrong id value")
];

let pageParamValidator=[
  param("page").optional().default("1").isInt().withMessage("page number should be integer")
];
let searchValidator=[param("value").optional().default("")
                    .isString().withMessage("search should be string")];

let productValidator=[
  body("name").isString().withMessage(" product Name should be exists."),
  body("subCategory").isMongoId().withMessage("wrong subCategory value.."),
  // body("subCategory.id").isMongoId().withMessage("wrong subCategory id value.."),
  // body("subCategory.name").isString().withMessage("wrong subCategory name value.."),
  body("brand").optional().isMongoId().withMessage("wrong barnd value"),
  body("description").optional().isString().withMessage("wrong description value"),
  body("offer").optional().isString().withMessage("wrong offer value"),
  body("unitPrice").isFloat().withMessage("wrong unitPrice Value"),
  body("basePrice").isFloat().withMessage("wrong basePrice Value"),
  body("stockAmount").isInt().withMessage("wrong stockAmount Value"),
  body("creditDiscount").optional().isFloat().withMessage("wrong creditDiscount Value"),
  body("cashDiscount").optional().isFloat().withMessage("wrong cashDiscount Value"),
  body("madeIn").optional().isString().withMessage("wrong madeIn Value"),
  body("productionDate").optional().isString().withMessage("wrong productionDate Value"),
  body("expireDate").optional().isString().withMessage("wrong expireDate Value"),
  body("reviews").optional().isObject().withMessage("wrong review value"),
  body("reviews.userId").optional().isMongoId().withMessage("wrong review user Id value"),
  body("reviews.reviewText").optional().isString().withMessage("wrong review reviewText value")
  
];
/************************
 * Authorization
 */
 router.use(JwtClass.checkJwt);

const checkDoctorAdmin=((request:any,response:any,next:any)=>{
             if(request.jwt.role=="doctor"|| request.jwt.role=="admin")
             next();
             else
             next(new Error("Un Authorized"));
 
 });
 
 const checkOnlyAdmin=function(request:any,response:any,next:any)
 {
     if(request.jwt.role!="admin") next(new Error("not Authorized"));
     else
     next();   
 }

/**************************** for mobile application ****************************/
//show random products 10/page based on catgeory type
// router.get("/random",_productController.getRandom);
//show 10/page products for specified subCategory

router.get("/subCategory/:subCategory/:page?",checkDoctorAdmin,
[
  param("subCategory").isMongoId().withMessage("wrong id value")
],pageParamValidator,
InputValidation.basicValidate,
_productController.getAll)

//show products details by id
router.get("/details/:id",checkDoctorAdmin
,InputValidation.basicValidate
,_productController.getProductDetails)  


/******************************** for admin **************************************/
//get all products by type product , medicine and accessories

router.get("/all/:type/:page?",checkOnlyAdmin,
[param("type").isIn(["product","medicine","accessories"])],InputValidation.basicValidate,
_productController.getAllProducts
)



//add new product without images
router.post("",productValidator
,InputValidation.basicValidate, checkOnlyAdmin,
_productController.post)  // without images

//get all images for product by id
router.get("/images/:id",checkOnlyAdmin,
idValidator,InputValidation.basicValidate
,_productController.getImages)

//add image to specifie product
router.route("/addimage/:id")      
      .all(checkOnlyAdmin,idValidator,InputValidation.basicValidate,
        multer({
        storage:productStorage,
        fileFilter:productFileFilter,
        limits
      }).single("image"),
     
      async (request:any,response:any,next:any)=>{
            try{
              const productObject:any=await ProductModel.findById({_id:request.params.id},{});
              if(productObject==null)
              next(new Error("This Product is not Exists"));

             
              const result=await cloudinary.uploader.upload(request.file?.path,{"folder":"images/products/"+request.params.id, transformation: [
                {width: 150, height: 150}]});//, , gravity: "face"crop: "thumb"}]});
              request.imageurl=result.secure_url;
              request.coudinaryId=result.public_id;
              next();
            }catch(error)
            {
              next(error);
            }
        })
      .post(_productController.updateImages);
//remove image for specified product
router.put("/removeimage",
[
  body("id").isMongoId().withMessage("wrong mongoId value"),
  body("deletedImage").isString().withMessage("wrong image value")
],
InputValidation.basicValidate,
checkOnlyAdmin,
async (request:any,resposne:any,next:any)=>{
   try
   {
      const productObject:any=await ProductModel.findById({_id:request.body.id},{images:1});
      if(productObject==null)
      next(new Error("This Product is no Longer Exists"));
        const deletedImage=productObject.images.find((image:any)=>{
          return image.url==request.body.deletedImage
        });
        await cloudinary.uploader.destroy(deletedImage.cloudinaryId);
      
     
      next();
   }catch(error)
   {
    next(error);
   }
  
}
,_productController.deleteImage
)

//update product data without images
router.put("",
productValidator
,InputValidation.basicValidate,
checkOnlyAdmin,_productController.put);


//delete product
router.delete("",checkOnlyAdmin,
async (request,resposne,next)=>{
  try{
    const productObject:any=await ProductModel.findById({_id:request.body.id},{images:1});
    
    if(productObject==null)
    next(new Error("This product is no longer Exists"));

    let orders=await OrderModel.find({
      "products.id":request.body.id}//, orderStatus:{$nin:["delivered","cancelled"]}
      ,"");

    if(orders.length!=0) throw new Error("some orders have this product ... ");
    
    if(productObject.images.length!=0)
    {
     await cloudinary.api.delete_resources_by_prefix("images/products/"+request.body.id);
     await cloudinary.api.delete_folder("images/products/"+request.body.id);
    }
    else
    {
      try{
        await cloudinary.api.delete_folder("images/products/"+request.body.id);
      }
      catch(e){}//catch will appear if there is no folder becaue no image was added
    }
    next();
  }catch(error){next(error)}
  
}
,_productController.delete);


router.get("/search/:id/:value?",checkDoctorAdmin,
searchValidator,idValidator,InputValidation.basicValidate,
_productController.autoCompleteSearchByName)

// router.get("/:id",
// checkOnlyAdmin,
// idValidator,InputValidation.basicValidate,
// _productController.getProduct)

export default router;
