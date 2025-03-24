import { Variant } from "../../Models/Variant.mjs";
import { Model } from "../../Models/Model.mjs";
import { Brand } from "../../Models/Brand.mjs";
import { Specification } from "../../Models/Specification.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, validationFailedRes, notFoundMessage, customFailedMessage } from "../../Helper/response.mjs";
import mongoose from "mongoose";
import { Faq } from "../../Models/Faq.mjs";
import { Media } from "../../Models/Media.mjs";
import { ModelController } from "../Api/ModelController.mjs"

export class VariantController {
    static async getVariantDetail(req, res) {
        try {
            const valid = new Validator(req.query, {
                brand: 'required',
                model: 'required',
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);

            var model = await Model.findOne({ slug: req.query.model, deletedAt: null });
            if (!model) {
                return notFoundMessage(res, "model is not found", {});
            }

            var isVariant = await Variant.findOne({ slug: req.query.slug, deletedAt: null });
            if (!isVariant) {
                return notFoundMessage(res, "Variant is not found", {});
            }

            const variant = await Variant.aggregate([
                { $match: { slug: req.query.slug, modelId: model._id, deletedAt: null } },
                {
                    $lookup: {
                        from: 'medias',
                        localField: '_id',
                        foreignField: 'moduleId',
                        as: 'medias'
                    }
                },
                {
                    $lookup: {
                        from: 'specifications',
                        localField: '_id',
                        foreignField: 'moduleId',
                        as: 'specifications'
                    }
                },

                {
                    $project: {
                        _id: 1, modelId: 1, name: 1, slug: 1, description: 1, news_keyword: 1, price: 1, seo_title: 1, seo_keywords: 1, seo_description: 1, seo_image: 1, createdAt: 1, updatedAt: 1,
                        medias: { $arrayElemAt: ["$medias.medias", 0] },
                        specifications: {
                            $map: {
                                input: '$specifications',
                                as: 'spec',
                                in: {
                                    k: '$$spec.attribute_name',
                                    v: '$$spec.values.value'
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        specifications: {
                            $arrayToObject: '$specifications'
                        }
                    }
                }
            ]);
            if (variant.length > 0) {
                var model = await Model.findOne({ _id: mongoose.Types.ObjectId(variant[0].modelId) })
                var brand = await Brand.findOne({ _id: mongoose.Types.ObjectId(model.brandId) })
                variant[0].model_name = model.name
                variant[0].model_slug = model.slug
                variant[0].brand_name = brand.name
                variant[0].brand_slug = brand.slug
                variant[0].article_tag = model.article_tag ?? brand.article_tag ?? ""
                variant[0].pros = model.pros;
                variant[0].cons = model.cons;
                variant[0].fuel_type = model.fuel_type;
                if (brand.slug != req.query.brand || model.slug != req.query.model) {
                    return notFoundMessage(res, "brand or model is not found", {});
                }
                var details = [];
                details['key_specification'] = (Object.keys(variant[0].specifications).length > 0) == true ? true : false
                details['variants'] = Variant.countDocuments({ modelId: variant[0].modelId, deletedAt: null })

                details['specification'] = Specification.aggregate([
                    { $match: { moduleId: mongoose.Types.ObjectId(variant[0]._id), type: "specification" } },
                    { $count: 'specificationCount' }
                ])
                details['features'] = Specification.aggregate([
                    { $match: { moduleId: mongoose.Types.ObjectId(variant[0]._id), type: "features" } },
                    { $count: 'featureCount' }
                ])
                details['reviews'] = Media.aggregate([
                    { $match: { moduleId: mongoose.Types.ObjectId(variant[0].modelId) } },
                    { $unwind: '$medias' },
                    { $match: { 'medias.media_type': 'youtube_review' } },
                    { $count: 'brandReviewCount' }
                ]);
                details['images'] = Media.aggregate([
                    { $match: { moduleId: mongoose.Types.ObjectId(variant[0].modelId) } },
                    { $unwind: '$medias' },
                    { $match: { 'medias.media_type': 'image' } },
                    { $count: 'imageCount' }
                ]);
                details['faqs'] = Faq.countDocuments({ moduleId: mongoose.Types.ObjectId(variant[0].modelId) })
                var [key_specification, variants, specification, features, reviews, images, faqs] = await Promise.all(Object.values(details));

                var navBar = {
                    key_specification: key_specification,
                    variants: variants > 0 ? true : false,
                    specification: specification.length > 0 ? true : false,
                    features: features.length > 0 ? true : false,
                    reviews: reviews.length > 0 ? true : false,
                    photo_gallery: images.length > 0 ? true : false,
                    faqs: faqs > 0 ? true : false
                }
                variant[0].navBar = navBar;
            }

            return success(res, "variant detail!", variant ? variant[0] : {});

        } catch (error) {
            return failed(res, error.message, 400);
        }
    }

    static async featureAndSpecification(req, res) {
        try {
            const valid = new Validator(req.query, {
                'model': 'required',
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            var model = await Model.findOne({ slug: req.query.model })
            if (!model) {
                return notFoundMessage(res, "model is not found", []);
            }
            var variant = await Variant.findOne({ slug: req.query.slug, modelId: model._id, deletedAt: null })
            if (!variant) {
                return notFoundMessage(res, "variant is not found", []);
            }

            const specificationsAndFeatures = await Specification.aggregate([
                { $match: { moduleId: variant._id } },
                {
                    $facet: {
                        specifications: [
                            { $match: { type: 'specification' } },
                            {
                                $group: {
                                    _id: '$sub_type',
                                    type: { $first: '$type' },
                                    sub_type_label: { $first: '$sub_type_label' },
                                    values: {
                                        $push: {
                                            k: '$attribute_name',
                                            v: { $map: { input: '$values', as: 'val', in: '$$val.value' } }
                                        }
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    sub_type: '$_id',
                                    type: 1,
                                    sub_type_label: 1,
                                    values: {
                                        $arrayToObject: '$values'
                                    }
                                }
                            }
                        ],
                        features: [
                            { $match: { type: 'features' } },
                            {
                                $group: {
                                    _id: '$sub_type',
                                    type: { $first: '$type' },
                                    sub_type_label: { $first: '$sub_type_label' },
                                    values: {
                                        $push: {
                                            k: '$attribute_name',
                                            v: { $map: { input: '$values', as: 'val', in: '$$val.value' } }
                                        }
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    sub_type: '$_id',
                                    type: 1,
                                    sub_type_label: 1,
                                    values: {
                                        $arrayToObject: '$values'
                                    }
                                }
                            }
                        ]
                    }
                }
            ]);
            // Format the respons
            var response = specificationsAndFeatures.map(group => {
                return {
                    specifications: group.specifications.map(item => {
                        return {
                            sub_type: item.sub_type,
                            type: item.type,
                            sub_type_label: item.sub_type_label,
                            values: Object.fromEntries(
                                Object.entries(item.values).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])
                            )
                        };
                    }),
                    features: group.features.map(item => {
                        return {
                            sub_type: item.sub_type,
                            type: item.type,
                            sub_type_label: item.sub_type_label,
                            values: Object.fromEntries(
                                Object.entries(item.values).map(([key, value]) => [key, Array.isArray(value) ? value : [value]])
                            )
                        };
                    })
                };
            });
            response = response.length > 0 ? response[0] : {}
            response = response ? await ModelController.formatSpecifications(response) : {};
            return success(res, "Variant specifications and features", response);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async filterVariants(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1; // Default to page 1
            const limit = parseInt(req.query.limit, 10) || 24; // Default to 24 items per page

            const skip = (page - 1) * limit;

            var brand_query = req.query.brands ? { slug: { $in: req.query.brands }, deletedAt: null } : { deletedAt: null };
            const brandResults = await Brand.find(brand_query, { _id: 1, name: 1 });
            const brandIds = brandResults.map(brand => brand._id);
            const modelResults = await Model.find({ brandId: { $in: brandIds }, deletedAt: null }, { _id: 1, name: 1 });
            const modelIds = modelResults.map(model => model._id);

            // Query for variants
            const query = {
                price: { $gte: req.query.min_price ? req.query.min_price : 0, $lte: (req.query.max_price ? req.query.max_price : 1000000000) },
                modelId: { $in: modelIds },
                deletedAt: null
            };

            // Fetch paginated variants
            const variants = await Variant.find(query, { name: 1, modelId: 1, slug: 1, fuel_type: 1, transmission: 1, price: 1 })
                .sort({ price: 1 })
                .skip(skip)
                .limit(limit)
                .lean();

            // Fetch models and brands
            const modelPromise = variants.map(item => Model.findOne({ _id: item.modelId }, { brandId: 1, name: 1, slug: 1, seo_image: 1 }));
            const models = await Promise.all(modelPromise);

            const brandPromise = models.map(item => Brand.findOne({ _id: item.brandId }, { slug: 1, name: 1 }));
            const brands = await Promise.all(brandPromise);

            // Attach model and brand information to variants
            variants.forEach((item, index) => {
                item.model_slug = models[index].slug;
                item.model_name = models[index].name;
                item.image = models[index].seo_image;
                item.brand_slug = brands[index].slug;
                item.brand_name = brands[index].name;
            });

            const totalVariants = await Variant.countDocuments(query);

            // get brands between given price range
            const getModels = await Model.find({
                min_price: { $gte: req.query.min_price },
                max_price: { $lte: req.query.max_price }
            }, { _id: 1, brandId: 1, name: 1 }).lean();
            const getBrand = getModels.map(item =>
                Brand.findOne({ _id: item.brandId }, { slug: 1, name: 1 }).lean()
            );

            const getBrands = await Promise.all(getBrand);
            const allBrands = [...new Map(getBrands.map(brand => [brand.slug, brand])).values()];

            const data = {
                variants,
                page,
                limit,
                totalPages: Math.ceil(totalVariants / limit),
                totalVariants,
                allBrands
            };

            return success(res, "success", data);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
}
