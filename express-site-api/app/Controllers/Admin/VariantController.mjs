import { Variant } from "../../Models/Variant.mjs";
import { Model } from "../../Models/Model.mjs";
import { Brand } from "../../Models/Brand.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage } from "../../Helper/response.mjs";
import mongoose from 'mongoose';
import { fileUpload, generateDescription } from "../../Helper/util.mjs";

export class VariantController {
    static async addVariant(req, res) {
        try {
            const valid = new Validator(req.body, {
                modelId: 'required',
                name: 'required',
                slug: 'required',
                price: 'required'
            });
            const moduleType = 'variant';

            let isExistSlug = await Variant.findOne({ modelId: req.body.modelId, slug: req.body.slug });
            if (!req.body.hasOwnProperty('variantId') && isExistSlug) {
                return customValidationFailed(res, 'slug is already exist!', 422);
            }
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            if (req.files && req.files.seo_image) {
                req.body.seo_image = await fileUpload(req.files.seo_image, `${moduleType}-${req.body.slug}-seo-image`);
            }
            req.body.deletedAt = req.body.status ? ((req.body.status == 'inactive') ? new Date() : null) : null;
            if (req.body.variantId) {
                const filter = { _id: mongoose.Types.ObjectId(req.body.variantId) };
                await Variant.findOneAndUpdate(filter, req.body);
                await VariantController.updatePriceRange(req.body.modelId);
                await VariantController.updateModel(req.body.modelId);
                return success(res, "variant updated successfully!");
            } else {
                var model = await Model.findOne({ _id: mongoose.Types.ObjectId(req.body.modelId) });
                var brand = await Brand.findOne({ _id: mongoose.Types.ObjectId(model.brandId) });
                req.body.seo_title = `${brand.name} ${model.name} ${req.body.name} On Road Price: ${model.name} ${req.body.name} Images, Colors, Features, Specifications, Reviews`
                req.body.seo_description = `${brand.name} ${model.name} ${req.body.name} on Road Price in India: Check out ${model.name} ${req.body.name} price, interior/exterior images, color variants, features, specifications, reviews, mileage and more on financialexpress.com.`
                req.body.seo_keywords = `${brand.name} ${model.name} ${req.body.name} manual price, ${brand.name} ${model.name} ${req.body.name} on road price in india, ${brand.name} ${model.name} ${req.body.name} images, ${brand.name} ${model.name} ${req.body.name} colors, ${brand.name} ${model.name} ${req.body.name} features, ${brand.name} ${model.name} ${req.body.name} specifications, ${brand.name} ${model.name} ${req.body.name} reviews, ${brand.name} ${model.name} ${req.body.name} mileage, ${brand.name} ${model.name} ${req.body.name} interior images, ${brand.name} ${model.name} ${req.body.name} exterior images`;
                await Variant.create(req.body);
                await VariantController.updatePriceRange(req.body.modelId);
                await VariantController.updateModel(req.body.modelId);
                return success(res, "variant added successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async updateModel(modelId) {
        var variant = await Variant.findOne({ modelId: modelId, deletedAt: null })
        var has_variant = variant ? true : false;
        await Model.findOneAndUpdate(
            { _id: modelId },
            { $set: { has_variant: has_variant }, }
        )
    }
    static async updatePriceRange(modelId) {
        try {
            const minMaxPrices = await Variant.aggregate([
                {
                    $match: {
                        modelId: mongoose.Types.ObjectId(modelId),
                    },
                },
                {
                    $project: {
                        price: {
                            $toDouble: "$price",
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        minPrice: {
                            $min: "$price",
                        },
                        maxPrice: {
                            $max: "$price",
                        },
                    },
                },
            ]);

            if (minMaxPrices.length > 0) {
                const { minPrice, maxPrice } = minMaxPrices[0];
                const model = await Model.findOne({ _id: modelId });
                if (model) {
                    await Model.findOneAndUpdate(
                        { _id: modelId },
                        { min_price: minPrice, max_price: maxPrice }
                    );
                }
            }
        } catch (error) {
            console.error(`Failed to update price range for modelId: ${modelId}`, error);
        }
    }
    static async variantList(req, res) {
        try {
            const valid = new Validator(req.body, {
                modelId: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            const page = parseInt(req.query.page) || 1;
            const limit = 300;
            const variants = await Variant.paginate({ modelId: req.body.modelId }, { page, limit, sort: { price: -1 } });
            const model = await Model.findById(req.body.modelId);
            const brand = await Brand.findById(model.brandId);
            const response = {
                brand: brand.name,
                model: model.name,
                variants: variants
            };
            return success(res, "variant list", response, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async generateVariantDescription(req, res) {
        try {
            const valid = new Validator(req.query, {
                'variant_id': 'required',
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);

            const description = await generateDescription(req.query.variant_id);
            return success(res, "Variant Description", description);
        } catch (error) {
            console.log(error.message);
            return failed(res, error.message, 400);
        }
    }
}
