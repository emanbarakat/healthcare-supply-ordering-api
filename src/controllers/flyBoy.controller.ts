import { BaseController } from "./base.controller";
import {FlyBoy} from "./../models/flyboy.model";


import { FlyBoyService } from "../services/flyBoy.service";



export class FlyBoyController extends BaseController<FlyBoy>
{
 
    _serviceObj=new FlyBoyService();
   
    
}
