import { Doctor, DoctorModel } from "./../models/doctor.model";
import { BaseService } from "./base.service";


export class DoctorService extends BaseService<Doctor> {
        _collectionName: string="doctors";
        _populate: string="";
        _model: Object=DoctorModel;
        _select:any="";

}