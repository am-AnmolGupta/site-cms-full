import { Specification } from "../../Models/Specification.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage } from "../../Helper/response.mjs";
import mongoose from 'mongoose';
import { Variant } from "../../Models/Variant.mjs";
import { Model } from "../../Models/Model.mjs";
import { Brand } from "../../Models/Brand.mjs";
import { deslufy } from "../../Helper/util.mjs"

export class SpecificationController {
    static async slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }
    static async addEditSpecification(req, res) {
        try {
            const numericRangeAttributes = ['displacement', 'mileage', 'seating-capacity', 'airbags', 'driving-range', 'max-motor-performance', 'battery-capacity'];
            const distinctRangeAttributes = ['transmission', 'fuel-type'];
            const valid = new Validator(req.body, {
                moduleId: 'required',
                moduleType: 'required|in:brand,model,variant',
                attributeId: 'required',
                attribute_name: 'required',
                values: 'required|array',
                type: 'required',
                sub_type: 'required'
            });
            const matched = await valid.check();
            if (!matched) {
                return validationFailedRes(res, valid);
            }
            var name = await SpecificationController.slugify(req.body.attribute_name);
            const handleRangeUpdate = async (attributeName) => {
                const isNumericRange = numericRangeAttributes.includes(attributeName.toLowerCase());
                const isDistinctRange = distinctRangeAttributes.includes(attributeName.toLowerCase());

                if (isNumericRange) {
                    await SpecificationController.updateRanges(req.body.moduleId, req.body.attributeId, 'num', attributeName.toLowerCase(), req.body.unit);
                } else if (isDistinctRange) {
                    await SpecificationController.updateRanges(req.body.moduleId, req.body.attributeId, 'distinct', attributeName.toLowerCase());
                }
            };
            req.body.sub_type_label = await deslufy(req.body.sub_type);
            if (req.body.specificationId) {
                const specification = await Specification.findOne({ _id: mongoose.Types.ObjectId(req.body.specificationId) });
                req.body.deletedAt = req.body.status ? ((req.body.status == 'inactive') ? new Date() : null) : null;
                const filter = { _id: mongoose.Types.ObjectId(req.body.specificationId) };
                await Specification.findOneAndUpdate(filter, req.body);
                await handleRangeUpdate(req.body.slug);

                if (name == 'transmission') {
                    const variant = await Variant.findById(req.body.moduleId);
                    console.log(variant);
                    console.log(req.body);
                    variant.transmission = req.body.values[0].value;
                    await variant.save();
                } else if (name == 'fuel-type') {
                    const variant = await Variant.findById(req.body.moduleId);
                    variant.fuel_type = req.body.values[0].value;
                    await variant.save();
                }
                return success(res, "specification updated successfully!");
            } else {
                await Specification.create(req.body);
                await handleRangeUpdate(req.body.slug);
                if (name == 'transmission') {
                    const variant = await Variant.findById(req.body.moduleId);
                    console.log(variant);
                    console.log(req.body);
                    variant.transmission = req.body.values[0].value;
                    await variant.save();
                } else if (name == 'fuel-type') {
                    const variant = await Variant.findById(req.body.moduleId);
                    variant.fuel_type = req.body.values[0].value;
                    await variant.save();
                }
                return success(res, "specification added successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async updateRanges(modelId, attributeId, type, name, unit) {
        const variant = await Variant.findOne({ _id: modelId });
        const model = await Model.findOne({ _id: variant.modelId });
        const variants = await Variant.find({ modelId: model._id });

        const getSpecValues = async (variant) => {
            const spec = await Specification.findOne({ moduleId: variant._id, attributeId });
            return spec ? spec.values : [];
        };

        const specValues = await Promise.all(variants.map(getSpecValues));
        const flattenedValues = specValues.flat().filter(val => val !== null);

        if (type === 'num') {
            const numericValues = flattenedValues.map(val => {
                if (name === 'mileage' || name === 'seating-capacity' || name === 'driving-range' || name === 'battery-capacity') {
                    const match = val.value.match(/(\d+(\.\d+)?)/);
                    return match ? parseFloat(match[0]) : NaN;
                } else if (name === 'airbags') {
                    const match = val.value.match(/^(\d+)/);
                    return match ? parseInt(match[0]) : NaN;
                }
                return parseInt(val.value);
            }).filter(val => !isNaN(val));

            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            if (name === 'seating-capacity') {
                name = 'seater';
            } else if (name === 'displacement') {
                name = 'engine';
            } else if (name === 'driving-range') {
                name = 'range';
            } else if (name === 'battery-capacity') {
                name = 'battery';
            }

            const update = { [`min_${name}`]: min, [`max_${name}`]: max };
            console.log(name);
            if (name === 'engine') {
                update.engine_unit = 'cc';
            } else if (name === 'mileage') {
                update.mileage_unit = unit;
            } else if (name === 'range') {
                update.range_unit = unit;
            } else if (name === 'battery') {
                update.battery_unit = unit;
            }

            await Model.findOneAndUpdate(
                { _id: model._id },
                { $set: update }
            );
        } else {
            const distinctValues = [...new Set(flattenedValues.map(val => val.value))];
            if (name === 'fuel-type') {
                name = 'fuel_type';
            }
            const update = { [name]: distinctValues };
            if (name === 'fuel_type' && distinctValues.includes('Electric')) {
                update.is_ev = true;
            }
            await Model.findOneAndUpdate(
                { _id: model._id },
                { $set: update }
            );
        }
    }


    static async specificationList(req, res) {
        try {
            const valid = new Validator(req.body, {
                moduleId: 'required',
                moduleType: 'required|in:brand,model,variant'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 200;
            const specifications = await Specification.paginate({ moduleId: req.body.moduleId, moduleType: req.body.moduleType }, { page, limit, sort: { attribute_name: 1 } });
            const variant = await Variant.findById(req.body.moduleId);
            const model = await Model.findById(variant.modelId);
            const brand = await Brand.findById(model.brandId);
            const response = {
                brand: brand.name,
                model: model.name,
                variant: variant.name,
                specifications: specifications
            };
            return success(res, "specification list", response, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async bulkAddSpecification(req, res) {
        try {
            const { moduleId, moduleType, specifications } = req.body;

            // Validate moduleId and moduleType here
            const mainValidation = new Validator(req.body, {
                moduleId: 'required',
                moduleType: 'required|in:brand,model,variant',
                specifications: 'required|array'
            });

            const mainMatched = await mainValidation.check();
            if (!mainMatched) {
                return validationFailedRes(res, mainValidation);
            }

            const errors = [];
            const addedSpecifications = [];

            const numericRangeAttributes = ['displacement', 'mileage', 'seating-capacity', 'airbags', 'driving-range', 'max-motor-performance', 'battery-capacity'];
            const distinctRangeAttributes = ['transmission', 'fuel-type'];

            const handleRangeUpdate = async (attributeName, moduleId, attributeId, unit) => {
                const isNumericRange = numericRangeAttributes.includes(attributeName.toLowerCase());
                const isDistinctRange = distinctRangeAttributes.includes(attributeName.toLowerCase());

                if (isNumericRange) {
                    await SpecificationController.updateRanges(moduleId, attributeId, 'num', attributeName.toLowerCase(), unit);
                } else if (isDistinctRange) {
                    await SpecificationController.updateRanges(moduleId, attributeId, 'distinct', attributeName.toLowerCase());
                }
            };

            for (const spec of specifications) {
                const specValidation = new Validator(spec, {
                    attributeId: 'required',
                    attribute_name: 'required',
                    values: 'required|array',
                    type: 'required',
                    sub_type: 'required'
                });

                const specMatched = await specValidation.check();
                if (!specMatched) {
                    errors.push({ spec, errors: specValidation.errors });
                    continue;
                }

                // Add moduleId and moduleType to each specification
                spec.moduleId = moduleId;
                spec.moduleType = moduleType;

                // Add specification if validation passed
                try {
                    const newSpec = await Specification.create(spec);
                    addedSpecifications.push(newSpec);
                    await handleRangeUpdate(spec.slug, moduleId, spec.attributeId, spec.unit);
                    var name = await SpecificationController.slugify(spec.attribute_name);
                    if (name == 'transmission') {
                        const variant = await Variant.findById(spec.moduleId);
                        console.log(variant);
                        console.log(spec.values);
                        variant.transmission = spec.values[0].value;
                        await variant.save();
                    } else if (name == 'fuel-type') {
                        const variant = await Variant.findById(spec.moduleId);
                        variant.fuel_type = spec.values[0].value;
                        await variant.save();
                    }

                } catch (err) {
                    errors.push({ spec, error: err.message });
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({ success: false, errors });
            }

            return success(res, "Specifications added successfully!", addedSpecifications);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
}
