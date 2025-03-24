import { success, failed } from "../../Helper/response.mjs";
import { Brand } from "../../Models/Brand.mjs";
import { Model } from "../../Models/Model.mjs";
import { Variant } from "../../Models/Variant.mjs";
export class DashboardController extends Error {
    static async getDashboard(req, res) {
        try {
            const [counts, brands] = await Promise.all([
                Brand.countDocuments(),
                Brand.aggregate([
                    {
                        $lookup: {
                            from: 'models',
                            localField: '_id',
                            foreignField: 'brandId',
                            as: 'models'
                        }
                    },
                    {
                        $lookup: {
                            from: 'variants',
                            localField: 'models._id',
                            foreignField: 'modelId',
                            as: 'variants'
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            models: {
                                $map: {
                                    input: '$models',
                                    as: 'model',
                                    in: {
                                        _id: '$$model._id',
                                        name: '$$model.name',
                                        variants: {
                                            $filter: {
                                                input: '$variants',
                                                as: 'variant',
                                                cond: { $eq: ['$$variant.modelId', '$$model._id'] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            models: {
                                $map: {
                                    input: '$models',
                                    as: 'model',
                                    in: {
                                        _id: '$$model._id',
                                        name: '$$model.name',
                                        variants: {
                                            $map: {
                                                input: '$$model.variants',
                                                as: 'variant',
                                                in: {
                                                    _id: '$$variant._id',
                                                    name: '$$variant.name'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    { $sort: { name: 1 } }
                ])
            ]);

            brands.forEach(brand => {
                brand.models.sort((a, b) => a.name.localeCompare(b.name));
                brand.models.forEach(model => {
                    model.variants.sort((a, b) => a.name.localeCompare(b.name));
                });
            });

            const totalBrands = counts;
            const totalModels = brands.reduce((acc, brand) => acc + brand.models.length, 0);
            const totalVariants = brands.reduce((acc, brand) => acc + brand.models.reduce((acc, model) => acc + model.variants.length, 0), 0);

            return success(res, "Brand model variant hierarchy fetched successfully", { totalBrands, totalModels, totalVariants, brands }, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async globalSearch(req, res) {
        const { query } = req.query;
        try {
            const regexPattern = new RegExp(query, 'i');

            // Fetch all brands, models, and variants
            const [brands, models, variants] = await Promise.all([
                Brand.find({ name: regexPattern }),
                Model.find({ name: regexPattern }),
                Variant.find({ name: regexPattern })
            ]);

            // Create a map from modelId to brandId
            const modelToBrandMap = models.reduce((acc, model) => {
                if (model._id && model.brandId) {
                    acc[model._id.toString()] = model.brandId;
                }
                return acc;
            }, {});

            // Fetch the brandId for each variant
            const variantResults = await Promise.all(
                variants.map(async (variant) => {
                    // Query model to get brandId
                    const model = await Model.findById(variant.modelId);
                    const brandId = model ? model.brandId : null;

                    return {
                        type: 'variant',
                        id: variant._id,
                        brandId: brandId,
                        modelId: variant.modelId,
                        name: variant.name
                    };
                })
            );

            const results = [
                ...brands.map(b => ({ type: 'brand', id: b._id, name: b.name })),
                ...models.map(m => ({ type: 'model', id: m._id, brandId: m.brandId, name: m.name })),
                ...variantResults
            ];

            return success(res, "Search results fetched successfully", { results });
        } catch (error) {
            console.error('Error in global search:', error);
            return failed(res, {}, error.message, 500);
        }
    }
    

}
