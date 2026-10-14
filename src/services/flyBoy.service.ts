import { FlyBoy,FlyBoyModel } from "./../models/flyboy.model";
import { BaseService } from "./base.service";



export class FlyBoyService extends BaseService<FlyBoy> {
        _collectionName: string="flyboys";
        _populate: string="";
        _model: Object=FlyBoyModel;

}