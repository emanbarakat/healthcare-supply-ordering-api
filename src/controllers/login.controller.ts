import { Request, Response, NextFunction } from "express";
import bcrypt=require("bcryptjs");
import { DoctorService } from "./../services/doctor.service";
import { PharmacistService } from "../services/pharmacist.service";
import { JwtClass } from "./../middelwraes/auth.middleware";
import { FlyBoyService } from "./../services/flyBoy.service";
import { AdminService } from "./../services/admin.service";
import { OrderService } from "../services/order.service";
import { ConnectionStates } from "mongoose";
import { pharmacistOrderService } from "../services/pharmacistOrder.service";


export class LoginController{
            _doctorService=new DoctorService();
            _pharmacistService=new PharmacistService();
            _flyboyService=new FlyBoyService();
            _adminService=new AdminService();
            _orderService=new OrderService();
            _pharmcistOrderService=new pharmacistOrderService();

    signIn=async(request:Request,response:Response,next:NextFunction)=>{
        let phone=request.body.phoneNumber;
        let password=request.body.password;
        let doctor:any;
        let pharmacist:any;
        let flyboy:any;
        let admin:any;
        try{
              
                switch(request.body.type)
                {
                    case "doctor":
                        doctor=  await this._doctorService.findOneByPhone(phone);
                        if(!doctor)
                        response.status(401).json({message:'phone number or password incorrect'});   
                        else{
                                if(doctor.accountStatus=="blocked")
                                {
                                    response.status(403).json({ message:" you're not allowed to login" });
                                }
                                else if (bcrypt.compareSync(password, doctor?.password)==true)
                                {
                                    const token=JwtClass.signinJwt(doctor,"doctor");
                                    doctor.password=0;

                                    //return also the late money and number of orders
                                      
                                    //
                                    let latePaid:any=await this._orderService.findAllAggregate([
                                        {$match:{userId:doctor._id,
                                         "payment.details.late":{$ne:0},"orderStatus":{$nin:["cancelled"]}}},
                                         {$group:{_id:"$userId",lateMoney:{$sum:"$payment.details.late"}}},
                                         {$project:{lateMoney:1,_id:0}}
                                    ]);
                                    let totalOrders:any=await this._orderService.findAllAggregate([
                                        {$match:{userId:doctor._id,
                                         "orderStatus":{$nin:["cancelled"]}}},
                                         {$group:{_id:"$userId",totalOrders:{$sum:1}}},
                                         {$project:{totalOrders:1,_id:0}}
                                    ]);
                                   
                                    if(totalOrders[0]!=undefined)
                                    totalOrders=totalOrders[0].totalOrders;
                                    else
                                    totalOrders=0;
                                    if(latePaid[0]!=undefined)
                                    latePaid=latePaid[0].lateMoney;
                                    else
                                    latePaid=0;

                                    response.status(200).json({ doctor, latePaid,totalOrders, token,userType:"doctor" });
                                }
                                else
                                {
                                
                                    response.status(401).json({message:'phone number or password incorrect'});   
                                }
                        }
                        
                    break;
                    case "pharmacist":
                        pharmacist=await this._pharmacistService.findOneByPhone(phone);
                       
                        if(!pharmacist)
                        response.status(401).json({message:'phone number or password incorrect'});   
                        else
                        {
                            if(pharmacist.accountStatus=="blocked")
                            {
                                response.status(403).json({ message:" you're not allowed to login" });
                            }
                            else if (bcrypt.compareSync(request.body.password, pharmacist?.password))
                            {
                                const token=JwtClass.signinJwt(pharmacist,"pharmacist");
                                pharmacist.password=0;
                                let latePaid:any=await this._pharmcistOrderService.findAllAggregate([
                                    {$match:{userId:pharmacist._id,
                                     "payment.details.late":{$ne:0},"orderStatus":{$nin:["cancelled"]}}},
                                     {$group:{_id:"$userId",lateMoney:{$sum:"$payment.details.late"}}},
                                     {$project:{lateMoney:1,_id:0}}
                                ]);
                                let totalOrders:any=await this._pharmcistOrderService.findAllAggregate([
                                    {$match:{userId:pharmacist._id,
                                     "orderStatus":{$nin:["cancelled"]}}},
                                     {$group:{_id:"$userId",totalOrders:{$sum:1}}},
                                     {$project:{totalOrders:1,_id:0}}
                                ]);
                               
                                if(totalOrders[0]!=undefined)
                                totalOrders=totalOrders[0].totalOrders;
                                else
                                totalOrders=0;
                                if(latePaid[0]!=undefined)
                                latePaid=latePaid[0].lateMoney;
                                else
                                latePaid=0;

                                response.status(200).json({ pharmacist, latePaid,totalOrders, token,userType:"pharmacist" });
                            }
                            else
                            {
                                response.status(401).json({message:'phone number or password incorrect'});   
                            }
                        }
                        
                        
                    break;
                    case "flyboy":
                        flyboy=  await this._flyboyService.findOneByPhone(phone);
                        
                        if(!flyboy)
                        response.status(401).json({message:'phone number or password incorrect'});   
                        else
                        {
                            if(flyboy.accountStatus=="blocked")
                            {
                                response.status(403).json({ message:" you're not allowed to login" });
                            }
                            else if (bcrypt.compareSync(request.body.password, flyboy?.password))
                            {
                                const token=JwtClass.signinJwt(flyboy,"flyboy");
                               
    
                                response.status(200).json({ id:flyboy._id, token });
                            }
                            else
                            {
                                response.status(401).json({message:'phone number or password incorrect'});   
                            }
                        }
                        
                    break;
                    case "admin":
                    case "subAdmin":
                        // console.log("here");
                       admin=  await this._adminService.findAllAggregate(
                        [{$match:{userName:request.body.userName}}])
                        console.log(admin)
                        admin=admin[0];
                        if(!admin)
                        response.status(401).json({message:'userName or password incorrect'});   
                        else{
                                if(admin.accountStatus=="blocked")
                                {
                                    response.status(403).json({ message:" you're not allowed to login" });
                                }
                                else if (bcrypt.compareSync(password, admin?.password)==true)
                                {
                                    const token=JwtClass.signinJwt(admin,"admin");
                                    admin.password=0;
                                    response.status(200).json({id:admin._id, token });
                                }
                                else
                                {
                                
                                    response.status(401).json({message:'userName or password incorrect'});   
                                }
                        }
                       break;
                    default:
                        response.status(401).json({message:'phone number or password incorrect!!!'});
                    break
                }
  
        }catch(error)
        {
            next(error);
        }
    }

}