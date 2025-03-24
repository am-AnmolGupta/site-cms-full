import { Model } from "../../Models/Model.mjs";
import { Brand } from "../../Models/Brand.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage } from "../../Helper/response.mjs";
import { fileUpload } from "../../Helper/util.mjs";
import mongoose from 'mongoose';

export class ModelController {
    static async addModel(req, res) {
        try {
            const isEdit = req.body.hasOwnProperty('modelId');
            const valid = new Validator(req.body, {
                brandId: 'required',
                name: 'required',
                slug: 'required'
            });
            const moduleType = 'model';

            let isExistSlug = await Model.findOne({ slug: req.body.slug });
            if (!isEdit && isExistSlug) {
                return customValidationFailed(res, 'slug already exists!', 422);
            }

            const matched = await valid.check();
            if (!matched) {
                return validationFailedRes(res, valid);
            }

            if (req.files && req.files.logo) {
                req.body.logo = await fileUpload(req.files.logo, `${moduleType}-${req.body.slug}-logo`);
            }

            if (req.files && req.files.seo_image) {
                req.body.seo_image = await fileUpload(req.files.seo_image, `${moduleType}-${req.body.slug}-seo-image`);
            }
            req.body.deletedAt = req.body.status ? ((req.body.status === 'inactive') ? new Date() : null) : null;

            if (isEdit) {
                const filter = { _id: mongoose.Types.ObjectId(req.body.modelId) };
                const existingModel = await Model.findOne(filter);
                if (!existingModel) {
                    return customFailedMessage(res, "Model not found", 404);
                }
                await Model.findOneAndUpdate(filter, req.body);
                return success(res, "Model updated successfully!");
            } else {
                const currentYear = new Date().getFullYear();
                var brand = await Brand.findOne({ _id: mongoose.Types.ObjectId(req.body.brandId) });
                req.body.seo_title = `${brand.name} ${req.body.name} Price ${currentYear}: ${brand.name} ${req.body.name} Images, Mileage, Colors, Reviews, Safety Ratings, Discount Offers ${currentYear}`;
                req.body.seo_description = `${brand.name} ${req.body.name} Price in India ${currentYear}: Check out the latest ${brand.name} ${req.body.name} Price on road price in India, interior and exterior images, color variants, mileage, safety ratings, features, specifications, engine, reviews, discount offers and more on financial express auto.`;
                req.body.seo_keywords = `${brand.name} ${req.body.name}, ${brand.name} ${req.body.name} Price, ${brand.name} ${req.body.name} Reviews, ${brand.name} ${req.body.name} Features, ${brand.name} ${req.body.name} Price in India, ${brand.name} ${req.body.name} Specification, ${brand.name} ${req.body.name} Variants, ${brand.name} ${req.body.name} Colors, ${brand.name} ${req.body.name} Images, ${brand.name} ${req.body.name} Videos, ${brand.name} ${req.body.name} Offers, ${brand.name} ${req.body.name} Discounts ${currentYear}`;
                await Model.create(req.body);
                return success(res, "Model added successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async modelList(req, res) {
        try {
            const valid = new Validator(req.body, {
                brandId: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const brand = await Brand.findById(req.body.brandId);
            const models = await Model.paginate({ brandId: req.body.brandId }, { page, limit, sort: { name: 1 } });
            const response = {
                brand: brand.name,
                models: models
            };
            return success(res, "model list", response, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
}