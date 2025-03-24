import { Attribute } from "../../Models/Attribute.mjs";
import { Specification } from "../../Models/Specification.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage } from "../../Helper/response.mjs";
import mongoose from 'mongoose';
import logger from "../../Helper/logger.mjs";

export class AttributeController {
    static async addEditAttribute(req, res) {
        try {
            const valid = new Validator(req.body, {
                name: 'required',
                type: 'required',
                acceptable_values: 'required|array',
                relates_to: 'required|array'
            });

            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);

            req.body.deletedAt = req.body.status ? ((req.body.status == 'inactive') ? new Date() : null) : null;
            if (req.body.attributeId) {
                let attribute = await Attribute.findOne({ _id: mongoose.Types.ObjectId(req.body.attributeId) });
                const filter = { _id: mongoose.Types.ObjectId(req.body.attributeId) };
                await Attribute.findOneAndUpdate(filter, req.body);
                return success(res, "attribute updated successfully!");
            } else {
                await Attribute.create(req.body);
                return success(res, "attribute added successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async attributeList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const attributes = await Attribute.paginate({}, { page, limit, sort: { name: 1 } });
            return success(res, "attribute list", attributes, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async getAttributes(req, res) {
        try {
            const results = await Attribute.distinct('type');
            return success(res, "attribute list", results, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async getAttributetypes(req, res) {
        try {
            const results = await Attribute.find({ type: (req.body.type) }, { _id: 1, name: 1 });
            return success(res, "attribute name list", results, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async getAttributeValues(req, res) {
        try {
            const values = await Attribute.find({ _id: mongoose.Types.ObjectId(req.body.attributeId) }, { acceptable_values: 1, unit: 1, slug: 1 })
            return success(res, "attribute values", values, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async getAttributeDetails(req, res) {
        try {
            const { moduleId } = req.body;

            // Fetch all specifications for the given moduleId
            const specifications = await Specification.find({ moduleId: mongoose.Types.ObjectId(moduleId) });

            // Extract the attributeIds from the specifications
            const specifiedAttributeIds = specifications.map(spec => spec.attributeId.toString());

            // Fetch all attributes where deleted_at is null
            const attributes = await Attribute.find({ deletedAt: { $eq: null } });

            // Filter out attributes that are already specified in the specifications
            const attributeDetails = attributes
                .filter(attr => !specifiedAttributeIds.includes(attr._id.toString()))
                .map(attr => ({
                    type: attr.type,
                    name: attr.name,
                    attributeId: attr._id.toString(),
                    acceptable_values: attr.acceptable_values.map(val => ({
                        value: val._id.toString(),
                        label: val.value
                    })),
                    unit: attr.unit,
                    slug: attr.slug
                }));

            res.json({ data: attributeDetails });
        } catch (error) {
            console.error("Error fetching attribute details:", error);
            res.status(500).send("Server Error");
        }
    }

}