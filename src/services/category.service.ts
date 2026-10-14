import { Document, Types } from "mongoose";
import { Category,CategoryModel } from "./../models/category.model";
import { SubCategory,SubCategoryModel } from "./../models/subCategory.model";
import { BaseService } from "./base.service";


export class CategoryService extends BaseService<Category> {
        _collectionName: string="categories";
        _populate: string="";
        _model: Object=CategoryModel;


}
export class SubCategoryService extends BaseService<SubCategory> {
        _collectionName: string="subcategories";
        _populate: string="";
        _model: Object=SubCategoryModel;

}