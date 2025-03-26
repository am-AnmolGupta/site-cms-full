import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import mongoose from "mongoose";
import { Channel } from "../../Models/Channel.mjs";
import { fileUpload } from '../../Helper/util.mjs';
export class ChannelController {

    static async addEditChannel(req, res) {
        try {
            const { channelId, status, slug } = req.body;

            const valid = new Validator(req.body, {
                title: "required",
                slug: "required",
            });
            if (!(await valid.check())) return validationFailedRes(res, valid);

            req.body.deletedAt = status === "inactive" ? new Date() : null;

            if (channelId) {
                const existingChannel = await Channel.findById(channelId);
                if (!existingChannel) return failed(res, {}, "Channel not found", 404);

                // Retain existing values if no new file is uploaded
                req.body.logoUnit = req.files?.logoUnit
                    ? fileUpload(req.files.logoUnit, `${slug}-logo`)
                    : existingChannel.logoUnit || "";

                req.body.seoImage = req.files?.seoImage
                    ? fileUpload(req.files.seoImage, `${slug}-seo-image`)
                    : existingChannel.seoImage || "";
            } else {
                // Handle cases where channelId is not provided (New channel creation)
                req.body.logoUnit = req.files?.logoUnit ? fileUpload(req.files.logoUnit, `${slug}-logo`) : "";
                req.body.seoImage = req.files?.seoImage ? fileUpload(req.files.seoImage, `${slug}-seo-image`) : "";
            }


            let channel;
            if (channelId && mongoose.Types.ObjectId.isValid(channelId)) {
                channel = await Channel.findByIdAndUpdate(channelId, req.body, { new: true });
                if (!channel) return failed(res, {}, "Channel not found", 404);
            } else {
                channel = await Channel.create(req.body);
            }

            const message = channelId ? "Channel updated successfully!" : "Channel added successfully!";
            return success(res, message, channel);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async channels(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const channels = await Channel.paginate({}, { page, limit, sort: { createdAt: -1 } });

            return success(res, "Channel list", channels, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
}