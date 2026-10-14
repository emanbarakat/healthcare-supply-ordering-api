/* for debugging performance */

// require('raygun-apm/http');
/**************************************/
import express=require("express");
import cors=require("cors");
import connectToDb from './core/db/connection';


import  registerRouter  from './routers/register.router';
import  errorMiddleWrae  from './middelwraes/Error.middleware';
import loginRouter from "./routers/login.router";
import doctorRouter from "./routers/doctor.router";
import pharmasistRouter from "./routers/pharmacist.router";
import adminRouter from "./routers/admin.router";
import categoryRouter from "./routers/category.router";
import subcategoryRouter from "./routers/subcategory.router";
import productRouter from "./routers/product.router";
import medicineRouter from "./routers/medicine.router";
import accessoryRouter from "./routers/accessory.router";
import orderRouter from "./routers/order.router";
import pharmacistOrderRouter from "./routers/pharmacistOrder.router";
import brandRouter from "./routers/brand.router";
import supplierRouter from "./routers/supplier.router";
import dotenv =require("dotenv");
import path = require("path");
import morgan from "morgan"


dotenv.config();
const app=express();
app.listen(process.env.PORT||8081,()=>{
    console.log(" server is listening ...",process.env.PORT||8081);
    /* open Db connection */ 
    connectToDb();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(morgan("tiny"));

/******************************************
 * Routes
 */
app.use(registerRouter);

app.use(loginRouter);
app.use("/doctor",doctorRouter);
app.use("/pharmacist",pharmasistRouter);
app.use("/categories",categoryRouter);
app.use("/subcategories",subcategoryRouter);
app.use("/products",productRouter);
app.use("/medicines",medicineRouter);
app.use("/accessories",accessoryRouter);
app.use("/orders",pharmacistOrderRouter);
app.use("/orders",orderRouter);
app.use("/suppliers",supplierRouter);
app.use("/brands",brandRouter);
app.use(adminRouter);

/**
 * Not Found
 */
 app.use((request,response,next)=>{
    response.status(404).json({message:"Page Not Found"});
});
/**
 * Error MiddleWare
 */
 app.use(errorMiddleWrae);



