import { Brand,BrandModel} from "./../models/brand.model";
import { BaseService } from "./base.service";


export class BrandService extends BaseService<Brand> {
        _collectionName: string="brands";
        _populate: string="";
        _model: Object=BrandModel;

}