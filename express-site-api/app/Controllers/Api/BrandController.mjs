import { Brand } from "../../Models/Brand.mjs";
import { Model } from "../../Models/Model.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage, notFoundMessage } from "../../Helper/response.mjs";
import { Media } from "../../Models/Media.mjs";
import mongoose from "mongoose";
import { Faq } from "../../Models/Faq.mjs";

export class BrandController extends Error {
    static async getBrandDetail(req, res) {
        try {
            const valid = new Validator(req.query, {
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            const brand = await Brand.findOne({ slug: req.query.slug, deletedAt: null });
            if (!brand) {
                return notFoundMessage(res, "brand is not found", {});
            }
            var brands = await Brand.aggregate([
                { $match: { slug: req.query.slug } },
                {
                    $lookup: {
                        from: 'models',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$deletedAt', null] },
                                            { $eq: ['$discontinued_model', false] },
                                            { $lt: ['$release_date', new Date()] }
                                        ]
                                    }
                                }
                            }
                        ],
                        localField: '_id',
                        foreignField: 'brandId',
                        as: 'models'
                    }
                },
                {
                    $addFields: {
                        models: { $slice: ['$models', 200] }
                    }
                },
                {
                    $project: {
                        _id: 1, name: 1, slug: 1, description: 1, logo: 1, article_tag: 1, seo_image: 1, seo_description: 1, seo_title: 1, seo_keywords: 1, createdAt: 1, updatedAt: 1,
                        models: {
                            _id: 1, name: 1, slug: 1, logo: 1, rating: 1, news_keyword: 1, min_price: 1, max_price: 1, min_mileage: 1, max_mileage: 1, min_engine: 1, max_engine: 1,
                            min_seater: 1, max_seater: 1, is_ev: 1, min_battery: 1, max_battery: 1, min_range: 1, max_range: 1, range_unit: 1, battery_unit: 1, mileage_unit: 1, engine_unit: 1,
                            seo_title: 1, seo_description: 1, seo_image: 1, seo_keywords: 1
                        }
                    }
                }
            ]);
            if (brands.length > 0) {
                brands = brands[0];
                var release_date = new Date();
                var modelList = await Model.find({ brandId: brands._id }, { _id: 1 })

                var details = [];

                details['models'] = Model.countDocuments({ brandId: brands._id })
                details['upcoming_models'] = Model.countDocuments({ brandId: brands._id, deletedAt: null, release_date: { $gt: release_date } })
                details['brandReviews'] = Media.aggregate([
                    { $match: { moduleId: mongoose.Types.ObjectId(brands._id) } },
                    { $unwind: '$medias' },
                    { $match: { 'medias.media_type': 'youtube_review' } },
                    { $count: 'brandReviewCount' }
                ]);
                details['modelReviews'] = Media.aggregate([
                    { $match: { moduleId: { $in: modelList.map(brand => mongoose.Types.ObjectId(brand._id)) } } },
                    { $unwind: '$medias' },
                    { $match: { 'medias.media_type': 'youtube_review' } },
                    { $count: 'modelReviewCount' }
                ]);
                details['images'] = Media.aggregate([
                    { $match: { moduleId: { $in: modelList.map(brand => mongoose.Types.ObjectId(brand._id)) } } },
                    { $unwind: '$medias' },
                    { $match: { 'medias.media_type': 'image' } },
                    { $count: 'imageCount' }
                ]);
                details['faqs'] = Faq.countDocuments({ moduleId: mongoose.Types.ObjectId(brands._id) })
                var [models, upcoming_models, brandReviews, modelReviews, images, faqs] = await Promise.all(Object.values(details));

                var navBar = {
                    models: models > 0 ? true : false,
                    upcoming_models: upcoming_models > 0 ? true : false,
                    reviews: (brandReviews.length > 0 || modelReviews > 0) ? true : false,
                    photo_gallery: images.length > 0 ? true : false,
                    faqs: faqs > 0 ? true : false
                }
                brands.navBar = navBar;
            } else {
                brands = {};
            }
            return success(res, "brand detail!", brands);

        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async upcomingModels(req, res) {
        try {
            const valid = new Validator(req.query, {
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            const release_date = new Date();
            var brand = await Brand.findOne({ slug: req.query.slug })
            if (!brand) {
                return notFoundMessage(res, "slug is not found", []);
            }
            var upcomingModels = await Model.find({ brandId: brand._id, deletedAt: null, release_date: { $gt: release_date } }, { _id: 1, name: 1, slug: 1, min_price: 1, release_date: 1, logo: 1, seo_title: 1, seo_image: 1, seo_description: 1, seo_keywords: 1 }).lean();
            return success(res, "upcoming models", upcomingModels);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }

    static async brandKeyHighlights(req, res) {
        try {
            const valid = new Validator(req.query, {
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            var brand = await Brand.findOne({ slug: req.query.slug })
            if (!brand) {
                return notFoundMessage(res, "slug is not found", {});
            }
            var popular_models = Model.find({ brandId: brand._id, popular_model: true, deletedAt: null }, { name: 1, slug: 1 }).limit(5).lean();
            var upcoming_models = Model.find({ brandId: brand._id, release_date: { $gt: new Date() }, deletedAt: null }, { name: 1, slug: 1, release_date: 1 }).limit(5).lean();
            var latest_launch = Model.find({ brandId: brand._id, release_date: { $lt: new Date() }, deletedAt: null }, { name: 1, slug: 1, release_date: 1 }).limit(5).lean();
            var most_expensive = Model.find({ brandId: brand._id, deletedAt: null }, { name: 1, slug: 1, max_price: 1 }).sort({ max_price: -1 }).limit(5).lean();
            var most_affordable = Model.find({ brandId: brand._id, deletedAt: null, max_price: { $lt: 1200000 } }, { name: 1, slug: 1, max_price: 1 }).sort({ max_price: -1 }).limit(5).lean();
            var lowest_price = Model.find({ brandId: brand._id, deletedAt: null }, { name: 1, slug: 1, min_price: 1 }).sort({ min_price: 1 }).limit(5).lean();

            [popular_models, upcoming_models, latest_launch, most_expensive, most_affordable, lowest_price] = await Promise.all([popular_models, upcoming_models, latest_launch, most_expensive, most_affordable, lowest_price])

            const data = {
                popular_models,
                upcoming_models,
                latest_launch,
                most_expensive,
                most_affordable,
                lowest_price
            };
            return success(res, "key highlights", data);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async discontinuedModels(req, res) {
        try {
            const valid = new Validator(req.query, {
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            var brand = await Brand.findOne({ slug: req.query.slug })
            if (!brand) {
                return notFoundMessage(res, "slug is not found", []);
            }
            var discontinuedModels = await Model.find({ brandId: brand._id, discontinued_model: true, deletedAt: null }, { name: 1, slug: 1, logo: 1 }).lean();
            return success(res, "discontinued cars", discontinuedModels);

        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
}
