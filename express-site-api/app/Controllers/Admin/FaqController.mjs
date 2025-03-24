import { Faq } from "../../Models/Faq.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage } from "../../Helper/response.mjs";
import mongoose from 'mongoose';
import { Brand } from "../../Models/Brand.mjs";
import { Model } from "../../Models/Model.mjs";
import { Variant } from "../../Models/Variant.mjs";
export class FaqController {
    static async addEditFaq(req, res) {
        try {

            const valid = new Validator(req.body, {
                moduleId: 'required',
                moduleType: 'required|in:brand,model,variant'
            });

            const matched = await valid.check()
            if (!matched) {
                return validationFailedRes(res, valid);
            }

            var isExist = await Faq.findOne({ moduleId: req.body.moduleId, moduleType: req.body.moduleType });
            if (isExist) {
                var faq_array = isExist.faqs.concat(req.body.faqs);
                req.body.faqs = faq_array
                const filter = { moduleId: mongoose.Types.ObjectId(req.body.moduleId) };
                await Faq.findOneAndUpdate(filter, req.body);
                return success(res, "FAQ added successfully!");
            }
            else {
                await Faq.create(req.body);
                return success(res, "FAQ added successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async editFaq(req, res) {
        try {

            if (req.body.status === 'inactive') {
                const result = await Faq.findOneAndUpdate(
                    { "moduleId": req.body.moduleId, "faqs._id": req.body.faqId },
                    { $set: { "faqs.$.deletedAt": new Date() } },
                    { new: true }
                );

                if (!result) {
                    return failed(res, {}, "Faq not found", 404);
                }

                return success(res, "Faq marked as inactive successfully!");
            } else {
                const result = await Faq.findOneAndUpdate(
                    { "moduleId": req.body.moduleId, "faqs._id": req.body.faqId },
                    {
                        $set: {
                            "faqs.$.question": req.body.question,
                            "faqs.$.answer": req.body.answer,
                            "faqs.$.deletedAt": null,
                        },
                    },
                    { new: true }
                );

                if (!result) {
                    return failed(res, {}, "Faq not found", 404);
                }

                return success(res, "Faq updated successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async faqList(req, res) {
        try {
            const valid = new Validator(req.body, {
                moduleId: 'required',
                moduleType: 'required|in:brand,model,variant',
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const faqs = await Faq.paginate({ moduleId: req.body.moduleId, moduleType: req.body.moduleType, deletedAt: null }, { page, limit });
            const { moduleType, moduleId } = req.body;
            let module;
            let additionalInfo = {};

            switch (moduleType) {
                case 'brand':
                    module = await Brand.findById(moduleId);
                    additionalInfo.brandName = module.name;
                    break;
                case 'model':
                    module = await Model.findById(moduleId);
                    if (module) {
                        const brand = await Brand.findById(module.brandId);
                        additionalInfo.brandName = brand ? brand.name : null;
                        additionalInfo.modelName = module.name;
                    }
                    break;
                case 'variant':
                    module = await Variant.findById(moduleId);
                    if (module) {
                        const model = await Model.findById(module.modelId);
                        if (model) {
                            const brand = await Brand.findById(model.brandId);
                            additionalInfo.brandName = brand ? brand.name : null;
                            additionalInfo.modelName = model.name;
                            additionalInfo.variantName = module.name;
                        }
                    }
                    break;

            }

            const response = {
                additionalInfo: additionalInfo,
                faqs: faqs
            };

            return success(res, "model list", response, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
}