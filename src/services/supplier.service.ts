import {Supplier,SupplierModel} from "./../models/supplier.model";
import { BaseService } from "./base.service";


export class SupplierService extends BaseService<Supplier> {
        _collectionName: string="suppliers";
        _populate: string="";
        _model: Object=SupplierModel;

}