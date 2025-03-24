import { Model } from "../../Models/Model.mjs";
import { Variant } from "../../Models/Variant.mjs";
import { Specification } from "../../Models/Specification.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, notFoundMessage, validationFailedRes } from "../../Helper/response.mjs";
import { Brand } from "../../Models/Brand.mjs";
import mongoose from 'mongoose';
import { Media } from "../../Models/Media.mjs";
import { Faq } from "../../Models/Faq.mjs";
import { specificationArray, featureArray } from "../../../config/attributes.mjs";

export class ModelController {
    static async getModelDetail(req, res) {
        try {
            const valid = new Validator(req.query, {
                brand: 'required',
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            var brandId = await Brand.findOne({ slug: req.query.brand, deletedAt: null });
            if (!brandId) {
                return notFoundMessage(res, "brand is not found", {});
            }
            var isModel = await Model.findOne({ slug: req.query.slug, deletedAt: null })
            if (!isModel) {
                return notFoundMessage(res, "model is not found", {});
            }
            var model = await Model.aggregate([
                {
                    $match: {
                        slug: req.query.slug,
                        brandId: brandId._id,
                        // has_variant: true,
                        deletedAt: null
                    }
                },
                {
                    $lookup: {
                        from: 'medias',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$deletedAt', null] },
                                        ]
                                    }
                                }
                            }
                        ],
                        localField: '_id',
                        foreignField: 'moduleId',
                        as: 'medias'
                    }
                },
                {
                    $project: {
                        _id: 1, brandId: 1, name: 1, slug: 1, description: 1, news_keyword: 1, article_tag: 1, release_date: 1, min_price: 1, max_price: 1, min_mileage: 1, max_mileage: 1, min_engine: 1, max_engine: 1, min_seater: 1, max_seater: 1, fuel_type: 1, transmission: 1, min_airbags: 1, max_airbags: 1,
                        is_ev: 1, min_battery: 1, max_battery: 1, min_range: 1, max_range: 1, range_unit: 1, battery_unit: 1, engine_unit: 1, mileage_unit: 1, seo_title: 1, seo_keywords: 1, seo_description: 1, seo_image: 1, pros: 1, cons: 1, createdAt: 1, updatedAt: 1, medias: { medias: 1 }
                        // medias: { $arrayElemAt: ["$medias.medias", 0] }
                    }
                }
            ]);
            if (model.length > 0) {
                if (model[0].medias.length > 0) {
                    var filteredMedias = model[0].medias[0].medias.filter(media => media.media_type === "image" && media.deletedAt === null);
                    model = [{
                        ...model[0],
                        medias: filteredMedias
                    }];
                }
                var brand = await Brand.findOne({ _id: mongoose.Types.ObjectId(model[0].brandId) })
                model[0].brand_name = brand.name
                model[0].brand_slug = brand.slug
                model[0].article_tag = (model[0].article_tag) ?? (brand.article_tag) ?? '';

                if (brand.slug != req.query.brand) {
                    return notFoundMessage(res, "brand_slug is not available", {});
                }

                var variants = await Variant.countDocuments({ modelId: model[0]._id, deletedAt: null })
                var variant = await Variant.findOne({ modelId: model[0]._id, deletedAt: null }, {}, { sort: { price: -1 } });


                var details = [];
                details['key_specification'] = (model.is_ev == true ? (model.min_battery != 0 ? true : false) : (model.min_engine != 0 ? true : false))
                if (variant) {

                    details['specification'] = Specification.aggregate([
                        { $match: { moduleId: variant._id, type: "specification" } },
                        { $count: 'specificationCount' }
                    ])
                    details['features'] = Specification.aggregate([
                        { $match: { moduleId: variant._id, type: "features" } },
                        { $count: 'featureCount' }
                    ])

                } else {
                    details['specification'] = [];
                    details['features'] = [];
                    details['key_specification'] = false;
                }
                details['brandReviews'] = Media.aggregate([
                    { $match: { moduleId: mongoose.Types.ObjectId(model[0].brandId) } },
                    { $unwind: '$medias' },
                    { $match: { 'medias.media_type': 'youtube_review' } },
                    { $count: 'brandReviewCount' }
                ]);
                details['modelReviews'] = Media.aggregate([
                    { $match: { moduleId: mongoose.Types.ObjectId(model[0]._id) } },
                    { $unwind: '$medias' },
                    { $match: { 'medias.media_type': 'youtube_review' } },
                    { $count: 'modelReviewCount' }
                ]);
                details['images'] = Media.aggregate([
                    { $match: { moduleId: mongoose.Types.ObjectId(model[0]._id) } },
                    { $unwind: '$medias' },
                    { $match: { 'medias.media_type': 'image' } },
                    { $count: 'imageCount' }
                ]);
                details['faqs'] = Faq.countDocuments({ moduleId: mongoose.Types.ObjectId(model[0]._id) })
                var [key_specification, specification, features, brandReviews, modelReviews, images, faqs] = await Promise.all(Object.values(details));

                var navBar = {
                    key_specification: key_specification,
                    variants: variants > 0 ? true : false,
                    specification: specification.length > 0 ? true : false,
                    features: features.length > 0 ? true : false,
                    reviews: (brandReviews.length > 0 || modelReviews > 0) ? true : false,
                    photo_gallery: images.length > 0 ? true : false,
                    faqs: faqs > 0 ? true : false
                }
                model[0].navBar = navBar;
            }

            return success(res, "model detail!", model = model.length > 0 ? model[0] : {});
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }

    static async featureAndSpecification(req, res) {
        try {
            const valid = new Validator(req.query, {
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            var model = await Model.findOne({ slug: req.query.slug })
            if (!model) {
                return notFoundMessage(res, "model is not available", {});
            }
            var baseVariant = await Variant.findOne({ modelId: model._id, deletedAt: null }, { name: 1, slug: 1 }, { sort: { price: -1 } }).lean();
            if (!baseVariant) {
                var baseVariant = await Variant.findOne({ modelId: model._id }, { _id: 1, modelId: 1 }).lean();
            }
            if (baseVariant) {
                const specificationsAndFeatures = await Specification.aggregate([
                    { $match: { moduleId: baseVariant._id } },
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
                                        sub_type_label: 1,
                                        type: 1,
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
                                        sub_type_label: 1,
                                        type: 1,
                                        values: {
                                            $arrayToObject: '$values'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]);

                // Format the response
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
                if (response.length > 0) {
                    response[0].variant = baseVariant;
                }
                response = response.length > 0 ? response[0] : {}
                response = response ? await ModelController.formatSpecifications(response) : {};
                return success(res, "model specifications and features", response);
            }
            else {
                return success(res, "variant not found", []);
            }
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async formatSpecifications(response) {
        response.specifications.forEach(spec => {
            const desiredOrderForSpec = specificationArray.find(order => order.sub_type === spec.sub_type);

            if (desiredOrderForSpec) {
                const reorderedValues = {};
                desiredOrderForSpec.values.forEach(key => {
                    if (spec.values[key]) {
                        reorderedValues[key] = spec.values[key];
                    }
                });
                Object.keys(spec.values).forEach(key => {
                    if (!desiredOrderForSpec.values.includes(key)) {
                        reorderedValues[key] = spec.values[key];
                    }
                });
                spec.values = reorderedValues;
            }

        });
        response.features.forEach(feature => {
            const desiredOrderForFeature = featureArray.find(order => order.sub_type === feature.sub_type);
            if (desiredOrderForFeature) {
                const reorderedFeatureValues = {};
                desiredOrderForFeature.values.forEach(key => {
                    if (feature.values[key]) {
                        reorderedFeatureValues[key] = feature.values[key];
                    }
                });
                Object.keys(feature.values).forEach(key => {
                    if (!desiredOrderForFeature.values.includes(key)) {
                        reorderedFeatureValues[key] = feature.values[key];
                    }
                });
                feature.values = reorderedFeatureValues;
            }
        });
        return response
    }
    static async variantList(req, res) {
        try {
            const valid = new Validator(req.query, {
                slug: 'required',
                fuel_type: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            var model = await Model.findOne({ slug: req.query.slug })
            if (!model) {
                return notFoundMessage(res, "model is not found", []);
            }
            if (req.query.fuel_type == "all") {
                var variants = await Variant.find({ modelId: model._id, deletedAt: null }, { _id: 1, name: 1, slug: 1, price: 1, fuel_type: 1, transmission: 1 }).lean().sort({ price: -1 });
            } else {
                var variants = await Variant.find({ modelId: model._id, fuel_type: req.query.fuel_type, deletedAt: null }, { _id: 1, name: 1, slug: 1, price: 1, fuel_type: 1, transmission: 1 }).lean().sort({ price: -1 });
            }
            var formattedVariants = variants.map(variant => ({
                _id: variant._id,
                name: variant.name,
                slug: variant.slug,
                price: variant.price,
                specifications: {
                    fuel_type: variant.fuel_type ? [variant.fuel_type] : [],
                    transmission: variant.transmission ? [variant.transmission] : []
                }
            }));

            return success(res, "model detail!", formattedVariants = formattedVariants != null ? formattedVariants : []);

        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async popularModels(req, res) {
        try {
            var models = await Model.find({ deletedAt: null }, { _id: 1, brandId: 1, name: 1, slug: 1 }).lean()
            const brandPromise = models.map(item => Brand.findOne({ _id: item.brandId }, { slug: 1 }));
            const brands = await Promise.all(brandPromise);

            models.map(model => {
                model.brand_slug = brands.find(brand => model.brandId.equals(brand._id))?.slug;
            })

            return success(res, "popular models", models);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async popularCars(req, res) {
        try {
            var models = await Model.find({ popular_model: true, deletedAt: null }, {
                _id: 1, brandId: 1, name: 1, slug: 1, rating: 1, min_price: 1, max_price: 1, min_mileage: 1, max_mileage: 1, min_engine: 1, max_engine: 1, min_seater: 1, max_seater: 1, fuel_type: 1, transmission: 1, min_airbags: 1, max_airbags: 1,
                is_ev: 1, min_battery: 1, max_battery: 1, min_range: 1, max_range: 1, range_unit: 1, battery_unit: 1, engine_unit: 1, mileage_unit: 1, seo_image: 1, seo_keywords: 1, seo_title: 1, seo_description: 1,
            }).lean().sort({ min_price: 1 })
            const brandPromise = models.map(item => Brand.findOne({ _id: item.brandId }, { slug: 1 }))
            const brands = await Promise.all(brandPromise)
            models.map(model => {
                model.brand_slug = brands.find(brand => model.brandId.equals(brand._id))?.slug;
            })
            return success(res, "popular cars", models);

        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async filterModels(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1; // Default to page 1
            const limit = parseInt(req.query.limit, 10) || 12; // Default to 24 items per page
            const skip = (page - 1) * limit;

            req.query.min_price = parseInt(req.query.min_price) ?? 0;
            req.query.max_price = parseInt(req.query.max_price) ?? 10000000;

            const query = {
                $or: [
                    {
                        min_price: {
                            $lte: req.query.min_price,
                        },
                        max_price: {
                            $lte: req.query.max_price,
                            $gte: req.query.min_price
                        },
                    },
                    {
                        min_price: {
                            $gte: req.query.min_price,
                        },
                        max_price: {
                            $lte: req.query.max_price,
                        },
                    },
                    {
                        max_price: {
                            $gte: req.query.max_price,
                        },
                        min_price: {
                            $gte: req.query.min_price,
                            $lte: req.query.max_price
                        },
                    },
                    {
                        min_price: {
                            $lte: req.query.min_price,
                        },
                        max_price: {
                            $gte: req.query.max_price,
                        },
                    }
                ],
                deletedAt: null
            };

            const allModels = await Model.find(query, { _id: 1, brandId: 1, name: 1, slug: 1, seo_image: 1, min_price: 1, max_price: 1 })
                .sort({ max_price: 1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const brandPromise = allModels.map(item => Brand.findOne({ _id: item.brandId }, { slug: 1, name: 1 }));
            const brands = await Promise.all(brandPromise);


            const models = [];

            // Attach model and brand information to variants
            for (let index = 0; index < allModels.length; index++) {
                const element = allModels[index];
                element.brand_slug = brands[index].slug;
                element.brand_name = brands[index].name;
                const [variants, totalVariants] = await Promise.all([
                    Variant.find({
                        modelId: element._id, deletedAt: null,
                        price: {
                            $gte: req.query.min_price,
                            $lte: req.query.max_price
                        }
                    }, { _id: 0, name: 1, slug: 1, price: 1 }).sort({ price: 1 }).lean().limit(3),
                    Variant.countDocuments({
                        modelId: element._id, deletedAt: null,
                        price: {
                            $gte: req.query.min_price,
                            $lte: req.query.max_price
                        }
                    })
                ])
                element.variants = variants
                element.totalVariants = totalVariants

                if (totalVariants >= 1) {
                    models.push(element);
                }
            }
            const totalModels = models.length;

            // get brands between given price range


            const data = {
                models,
                page,
                limit,
                totalPages: Math.ceil(totalModels / limit),
                totalModels
            };

            return success(res, "success", data);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }

}
