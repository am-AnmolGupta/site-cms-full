import { Variant } from "../../Models/Variant.mjs";
import { Model } from "../../Models/Model.mjs";
import { Brand } from "../../Models/Brand.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, validationFailedRes, notFoundMessage, customFailedMessage } from "../../Helper/response.mjs";
import mongoose, { deleteModel } from "mongoose";

export class SitemapController {
    static async brandSitemap(req, res) {
        try {

            var brand = await Brand.find({ deletedAt: null }, { slug: 1, updatedAt: 1 }).lean();
            if (req.query.type == "brand") {
                return success(res, "brands", brand);
            }
            else if (req.query.type == "model") {
                var brandIds = await Brand.find({ deletedAt: null }, { _id: 1 });
                var models = await Model.find({ brandId: { $in: brandIds }, deletedAt: null }, { _id: 1, brandId: 1, slug: 1, updatedAt: 1 }).lean();

                // var models = await Model.find({}, { brandId: 1, slug: 1, updatedAt: 1 }).lean();
                for (let i = 0; i < models.length; i++) {
                    var brand = await Brand.findOne({ _id: models[i].brandId }, { name: 1, slug: 1 })
                    models[i].brand_slug = brand.slug
                }
                return success(res, "models", models);
            }
            else if (req.query.type == "variant") {
                var brandIds = await Brand.find({ deletedAt: null }, { _id: 1 });
                var modelIds = await Model.find({ brandId: { $in: brandIds }, deletedAt: null }, { _id: 1 })
                var variants = await Variant.find({ modelId: { $in: modelIds }, deletedAt: null }, { modelId: 1, name: 1, slug: 1, updatedAt: 1 }).lean()

                const modelPromise = variants.map(item => Model.findOne({ _id: item.modelId }, { brandId: 1, slug: 1 }));
                const models = await Promise.all(modelPromise);

                const brandPromise = models.map(item => Brand.findOne({ _id: item.brandId }, { slug: 1 }));
                const brands = await Promise.all(brandPromise);

                variants.forEach((item, index) => {
                    item.model_slug = models[index].slug;
                    item.brand_slug = brands[index].slug;
                });

                return success(res, "variants", variants);

            }

        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
}
