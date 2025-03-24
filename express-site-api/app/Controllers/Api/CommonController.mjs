import { Brand } from "../../Models/Brand.mjs";
import { Model } from "../../Models/Model.mjs";
import { Variant } from "../../Models/Variant.mjs";
import { Media } from "../../Models/Media.mjs";
import { Faq } from "../../Models/Faq.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, notFoundMessage, validationFailedRes, customFailedMessage } from "../../Helper/response.mjs";
import logger from '../../Helper/logger.mjs';
import mongoose, { model } from 'mongoose';
import { Attribute } from "../../Models/Attribute.mjs";

export class CommonController {
    static async moduleListing(req, res) {
        try {
            if (req.query.type == "brands") {
                req.query.slug = "all"
            }
            const valid = new Validator(req.query, {
                type: 'required|in:brands,models,variants',
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            if (req.query.type == "brands") {
                var listing = await Brand.find({ deletedAt: null }, { _id: 1, name: 1, slug: 1, logo: 1, rank: 1 }).sort({ rank: -1 }).lean();
                return success(res, "brand listing", listing);
            }
            if (req.query.type == "models") {
                var brand = await Brand.findOne({ slug: req.query.slug })
                if (!brand) {
                    return notFoundMessage(res, "slug is not found", []);
                }
                var listing = await Model.find({ brandId: brand._id, deletedAt: null }, { _id: 1, name: 1, slug: 1, logo: 1 }).lean();
                return success(res, "model listing", listing);
            }
            if (req.query.type == "variants") {
                var model = await Model.findOne({ slug: req.query.slug })
                if (!model) {
                    return notFoundMessage(res, "slug is not found", []);
                }
                var listing = await Variant.find({ modelId: model._id, deletedAt: null }, { _id: 1, name: 1, slug: 1 }).lean();
                return success(res, "variant listing", listing);
            }
            return failed(res, {}, error.message, 400);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async review(req, res) {
        try {
            const valid = new Validator(req.query, {
                type: 'required|in:brand,model,variant',
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            const media_type = "youtube_review";
            switch (req.query.type) {
                case 'brand':
                    var module = await Brand.findOne({ slug: req.query.slug })
                    break;
                case 'model':
                    var module = await Model.findOne({ slug: req.query.slug })
                    break;
                case 'variant':
                    var module = await Variant.findOne({ slug: req.query.slug })
                    break;
            }
            if (!module) {
                return notFoundMessage(res, "slug is not found", []);
            }
            var reviews = await Media.aggregate([
                {
                    $match: {
                        moduleId: module._id,
                        moduleType: req.query.type
                    }
                },
                {
                    $project: {
                        title: 1,
                        _id: 0,
                        source_path: 1,
                        media_type: 1,
                        seo_title: 1,
                        seo_description: 1,
                        reviews: {
                            $filter: {
                                input: "$medias",
                                as: "media",
                                cond: {
                                    $and: [
                                        { $eq: ["$$media.media_type", media_type] },
                                        { $eq: ["$$media.deletedAt", null] }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        "reviews.media_type": media_type
                    }
                }
            ]);
            // if (reviews) {
            if (req.query.type == "brand" && (reviews.length === 0 || (reviews[0] && reviews[0].reviews.length < 3))) {
                const models = await Model.find({ brandId: module._id }, { _id: 1 });
                const modelIds = models.map(model => model._id);
                const otherReviews = await Media.aggregate([
                    {
                        $match: {
                            moduleId: { $in: modelIds }
                        }
                    },
                    {
                        $unwind: "$medias"
                    },
                    {
                        $match: {
                            "medias.media_type": "youtube_review",
                            "medias.deletedAt": null
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            reviews: {
                                $push: {
                                    title: "$medias.title",
                                    source_path: "$medias.source_path",
                                    media_type: "$medias.media_type",
                                    thumbnail_video_id: "$medias.thumbnail_video_id",
                                    seo_title: "$medias.seo_title",
                                    seo_description: "$medias.seo_description",
                                    deletedAt: "$medias.deletedAt",
                                    _id: "$medias._id",
                                    thumbnail: "$medias.thumbnail"
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            reviews: 1
                        }
                    }
                ]);
                if (reviews.length > 0 && otherReviews.length > 0) {
                    var data = [
                        {
                            "reviews": [...reviews[0].reviews, ...otherReviews[0].reviews]
                        }
                    ]

                } else if (otherReviews.length > 0 && reviews.length == 0) {
                    var data = [
                        {
                            "reviews": otherReviews[0].reviews
                        }
                    ]
                }
                else if (reviews.length > 0 && otherReviews.length == 0) {
                    var data = [
                        {
                            "reviews": reviews[0].reviews
                        }
                    ]
                } else {
                    return success(res, "all reviews", {});
                }

                const uniqueReviews = data[0].reviews.reduce((acc, current) => {
                    const exists = acc.find(item => item.source_path === current.source_path);

                    if (!exists) {
                        acc.push(current);
                    }

                    return acc;
                }, []);
                return success(res, "all reviews", data = { "reviews": uniqueReviews });

                // return success(res, "all reviews", data = data.length > 0 ? data[0] : {});
            }
            else if (req.query.type == "model" && (reviews.length === 0 || (reviews[0] && reviews[0].reviews.length < 3))) {
                var otherReviews = await Media.aggregate([
                    {
                        $match: {
                            moduleId: module.brandId,
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            _id: 0,
                            source_path: 1,
                            media_type: 1,
                            seo_title: 1,
                            seo_description: 1,
                            reviews: {
                                $filter: {
                                    input: "$medias",
                                    as: "media",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$media.media_type", media_type] },
                                            { $eq: ["$$media.deletedAt", null] }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            "reviews.media_type": media_type
                        }
                    }
                ]);

                if (reviews.length > 0 && otherReviews.length > 0) {
                    var data = [
                        {
                            "reviews": [...reviews[0].reviews, ...otherReviews[0].reviews]
                        }
                    ]

                } else if (otherReviews.length > 0 && reviews.length == 0) {
                    var data = [
                        {
                            "reviews": otherReviews[0].reviews
                        }
                    ]
                }
                else if (reviews.length > 0 && otherReviews.length == 0) {
                    var data = [
                        {
                            "reviews": reviews[0].reviews
                        }
                    ]
                } else {
                    return success(res, "all reviews", {});
                }

                const uniqueReviews = data[0].reviews.reduce((acc, current) => {
                    const exists = acc.find(item => item.source_path === current.source_path);

                    if (!exists) {
                        acc.push(current);
                    }

                    return acc;
                }, []);

                return success(res, "all reviews", data = { "reviews": uniqueReviews });
                // return success(res, "all reviews", data = data.length > 0 ? data[0] : {});
            }
            // }
            return success(res, "all reviews", reviews = reviews.length > 0 ? reviews[0] : {});
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }


    static async faq(req, res) {
        try {
            const valid = new Validator(req.query, {
                type: 'required|in:brand,model,variant',
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            switch (req.query.type) {
                case 'brand':
                    var module = await Brand.findOne({ slug: req.query.slug })
                    break;
                case 'model':
                    var module = await Model.findOne({ slug: req.query.slug })
                    break;
                case 'variant':
                    var module = await Variant.findOne({ slug: req.query.slug })
                    break;
            }
            if (!module) {
                return notFoundMessage(res, "slug is not found", []);
            }
            var faqs = await Faq.aggregate([
                {
                    $match: {
                        moduleId: module._id,
                        moduleType: req.query.type
                    }
                },
                {
                    $project: {
                        _id: 0,
                        faqs: {
                            $filter: {
                                input: "$faqs",
                                as: "faq",
                                cond: { $eq: ["$$faq.deletedAt", null] }
                            }
                        }
                    }
                }
            ]);
            return success(res, "faqs", faqs = faqs.length > 0 ? faqs[0] : {});

        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async media(req, res) {
        try {
            const valid = new Validator(req.query, {
                type: 'required|in:brand,model,variant',
                slug: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            switch (req.query.type) {
                case 'brand':
                    var module = await Brand.findOne({ slug: req.query.slug, deletedAt: null })
                    break;
                case 'model':
                    var module = await Model.findOne({ slug: req.query.slug, deletedAt: null })
                    break;
                case 'variant':
                    var module = await Variant.findOne({ slug: req.query.slug, deletedAt: null })
                    break;
            }
            if (!module) {
                return success(res, "data not found", []);
            }
            if (req.query.type == "brand") {
                var models = await Model.find({ brandId: mongoose.Types.ObjectId(module._id), deletedAt: null }, { _id: 1 })
                const modelIds = models.map(model => model._id);
                var media = await Media.aggregate([
                    {
                        $match: {
                            moduleId: { $in: modelIds },
                        }
                    },
                    {
                        $lookup: {
                            from: 'models',
                            localField: 'moduleId',
                            foreignField: '_id',
                            as: 'modelDetails'
                        }
                    },
                    {
                        $unwind: '$modelDetails'
                    },
                    {
                        $project: {
                            _id: 0,
                            model_name: '$modelDetails.name',
                            medias: {
                                $slice: [
                                    {
                                        $filter: {
                                            input: "$medias",
                                            as: "media",
                                            cond: {
                                                $and: [
                                                    { $eq: ["$$media.media_type", "image"] },
                                                    { $eq: ["$$media.deletedAt", null] }
                                                ]
                                            }
                                        }
                                    },
                                    3
                                ]
                            }
                        }
                    }
                ]);
                return success(res, "media gallery", media);

            } else {
                var media = await Media.aggregate([
                    {
                        $match: {
                            moduleId: module._id,
                            moduleType: req.query.type
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            medias: {
                                $filter: {
                                    input: "$medias",
                                    as: "media",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$media.deletedAt", null] },
                                            { $eq: ["$$media.media_type", "image"] }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ]);
            }
            return success(res, "media gallery", media = media.length > 0 ? media[0] : {});
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async allReviews(req, res) {
        try {
            const results = await Media.find(
                {
                    'medias.media_type': 'youtube_review',
                    'medias.deletedAt': null
                },
                {
                    _id: 0, 'medias': 1
                }
            ).limit(10);

            const reviews = results.flatMap(item =>
                item.medias.filter(media => media.media_type === 'youtube_review')
                    .map(media => ({
                        title: media.title,
                        media_type: media.media_type,
                        source_path: media.source_path,
                        thumbnail: media.thumbnail,
                        thumbnail_video_id: media.thumbnail_video_id
                    }))
            );
            const uniqueReviews = reviews.reduce((acc, current) => {
                const exists = acc.find(item => item.source_path === current.source_path);
                if (!exists) {
                    acc.push(current);
                }
                return acc;
            }, []);
            return success(res, "all reviews", uniqueReviews);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async modelUpdate(req, res) {
        var models = await Model.find({}, { _id: 1 });
        for (const model of models) {
            const variant = await Variant.findOne({ modelId: model._id, deletedAt: null });
            const has_variant = variant ? true : false;

            await Model.findOneAndUpdate(
                { _id: model._id },
                { $set: { has_variant: has_variant } }
            );
        }
        return success(res, "success", {});
    }
}