import { Brand } from "../../Models/Brand.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage } from "../../Helper/response.mjs";
import { fileUpload } from "../../Helper/util.mjs";
import logger from '../../Helper/logger.mjs';
import mongoose from 'mongoose';

export class BrandController extends Error {
    static async addBrand(req, res) {
        try {
            if (!req.files && !req.body.hasOwnProperty('brandId')) {
                return customValidationFailed(res, 'Logo is mandatory', 422);
            }
            const valid = new Validator(req.body, {
                name: 'required',
                slug: 'required',
                description: 'required'
            });

            // Check if the slug already exists
            let isExistSlug = await Brand.findOne({ slug: req.body.slug });
            if (!req.body.hasOwnProperty('brandId') && isExistSlug) {
                return customValidationFailed(res, 'Slug already exists!', 422);
            }
            const matched = await valid.check();
            if (!matched) return validationFailedRes(res, valid);
            const moduleType = 'brand';

            if (req.body.brandId) {
                const filter = { _id: mongoose.Types.ObjectId(req.body.brandId) };
                const existingBrand = await Brand.findOne(filter);
                if (!existingBrand) {
                    return customValidationFailed(res, 'Brand not found', 404);
                }

                try {
                    req.body.logo = (req.files && req.files.logo ? fileUpload(req.files.logo, `${moduleType}-${req.body.slug}-logo`) : existingBrand.logo);
                    req.body.seo_image = req.files && req.files.seo_image ? fileUpload(req.files.seo_image, `${moduleType}-${req.body.slug}-seo-image`) : existingBrand.seo_image;
                } catch (fileError) {
                    console.error('File upload error:', fileError.message);
                }
                req.body.deletedAt = req.body.status ? ((req.body.status == 'inactive') ? new Date() : null) : null;
                req.body.seo_title = req.body.seo_title === '' ? req.body.name : req.body.seo_title;
                await Brand.findOneAndUpdate(filter, req.body);
                return success(res, "Brand updated successfully!");
            } else {
                try {
                    req.body.logo = req.files && req.files.logo ? fileUpload(req.files.logo, `${moduleType}-${req.body.slug}-logo`) : '';
                    req.body.seo_title = `${req.body.name} Cars 2024: ${req.body.name} New Cars, 2024 ${req.body.name} Car Price in India, Images, Reviews`;
                    req.body.seo_description = `${req.body.name} Car Price 2024: Check ${req.body.name} new cars 2024 price in India, new ${req.body.name} car launch date, ${req.body.name} car reviews on financialexpress.com. Planning to buy a ${req.body.name} car? check ${req.body.name} cars features, specifications, engine, mileage, interior and exterior images, reviews and more.`
                    req.body.seo_keywords = `${req.body.name} cars, new ${req.body.name} cars, ${req.body.name} cars 2024, ${req.body.name} car price in india, ${req.body.name} electric car, ${req.body.name} cng car, ${req.body.name} suv car, ${req.body.name} hatchback car, ${req.body.name} cars reviews, ${req.body.name} cars new launches, ${req.body.name} sedan cars, ${req.body.name} car features, ${req.body.name} cars specifications`;
                    req.body.seo_image = req.files && req.files.seo_image ? fileUpload(req.files.seo_image, `${moduleType}-${req.body.slug}-seo_image`) : '';
                    req.body.deletedAt = req.body.status ? ((req.body.status === 'inactive') ? new Date() : null) : null;
                } catch (fileError) {
                    console.error('File upload error:', fileError.message);
                }
                await Brand.create(req.body);
                return success(res, "Brand added successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async brandList(req, res) {

        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const brands = await Brand.paginate({}, { page, limit, sort: { name: 1 } });
            // for (let i = 0; i < brands.length; i++) {
            //     brands[i].model_count = await brands[i].getModelCount();
            // }
            return success(res, "brand list", brands, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
}