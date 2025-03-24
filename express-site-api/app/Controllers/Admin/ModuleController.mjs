import { Brand } from "../../Models/Brand.mjs";
import { Model } from "../../Models/Model.mjs";
import { Variant } from "../../Models/Variant.mjs";
import { Specification } from "../../Models/Specification.mjs";
import { Attribute } from "../../Models/Attribute.mjs";
import { success, failed, customFailedMessage } from "../../Helper/response.mjs";

export class ModuleController extends Error {
    static async moduleDetail(req, res) {
        try {
            const { moduleType, moduleId } = req.body;
            let module;
            let additionalInfo = {};

            switch (moduleType) {
                case 'brand':
                    module = await Brand.findById(moduleId);
                    break;
                case 'model':
                    module = await Model.findById(moduleId);
                    if (module) {
                        const brand = await Brand.findById(module.brandId);
                        additionalInfo.brandName = brand ? brand.name : null;
                    }
                    break;
                case 'variant':
                    module = await Variant.findById(moduleId);
                    if (module) {
                        const model = await Model.findById(module.modelId);
                        if (model) {
                            const brand = await Brand.findById(model.brandId);
                            additionalInfo.modelName = model.name;
                            additionalInfo.brandName = brand ? brand.name : null;
                        }
                    }
                    break;
                case 'specification':
                    module = await Specification.findById(moduleId);
                    if (module) {
                        const variant = await Variant.findById(module.moduleId);
                        if (variant) {
                            const model = await Model.findById(variant.modelId);
                            if (model) {
                                const brand = await Brand.findById(model.brandId);
                                additionalInfo.variantName = variant.name;
                                additionalInfo.modelName = model.name;
                                additionalInfo.brandName = brand ? brand.name : null;
                            }
                        }
                    }
                    break;
                case 'attribute':
                    module = await Attribute.findById(moduleId);
                    break;
                default:
                    return customFailedMessage(res, "Module type not found", 400);
            }

            if (!module) {
                return customFailedMessage(res, "Module not found", 404);
            }

            const moduleData = module.toObject({ virtuals: true });
            const combinedData = { ...moduleData, ...additionalInfo };

            return success(res, "Module details", combinedData, 200);
        } catch (error) {
            return failed(res, {}, error.message, 500);
        }
    }
}