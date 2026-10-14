import { Pharmacist, PharmacistModel } from "../models/pharmacist.model";

import { BaseService } from "./base.service";


export class PharmacistService extends BaseService<Pharmacist> {
        _collectionName: string="pharmacists";
        _populate: any="";
        _model: Object=PharmacistModel;
        _select:any={};
}