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
    static async channelSocialLinks(req, res) {
        try {
            const valid = new Validator(req.query, {
                channelId: "required",
            });
            if (!(await valid.check())) return validationFailedRes(res, valid);
            const { channelId } = req.query;
            const channelSocialLinks = await Channel.findById(channelId, "socialLinks");

            return success(res, "Channel Social Links list", channelSocialLinks, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async addSocialLinks(req, res) {
        try {
            // Convert flattened socialLinks to an array
            const socialLinks = [];
            Object.keys(req.body).forEach((key) => {
                const match = key.match(/^socialLinks\[(\d+)]\[(\w+)]$/);
                if (match) {
                    const index = parseInt(match[1]);
                    const field = match[2];
                    if (!socialLinks[index]) {
                        // Ensure object exists with default values
                        socialLinks[index] = { platform: "", description: "", url: "" };
                    }
                    socialLinks[index][field] = req.body[key] || ""; // Ensure empty string if missing
                }
            });

            // Validate that all social links contain required fields
            for (const link of socialLinks) {
                if (!link.platform || !link.url || !link.description) {
                    return failed(res, {}, "All social link fields are required", 422);
                }
            }

            req.body.socialLinks = socialLinks;

            const valid = new Validator(req.body, {
                channelId: "required",
                socialLinks: "required|array",
            });

            if (!(await valid.check())) return validationFailedRes(res, valid);

            const { channelId } = req.body;
            const channel = await Channel.findById(channelId);

            if (!channel) return failed(res, {}, "Channel not found", 404);

            // Append new social links while avoiding duplicates
            channel.socialLinks = [...(channel.socialLinks || []), ...socialLinks];
            await channel.save();

            return success(res, channel, "Social links updated successfully");
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async editSocialLinks(req, res) {
        try {
            const valid = new Validator(req.body, {
                channelId: "required",
                socialLinkId: "required",
                platform: "required",
                description: "required",
                url: "required",
            });

            if (!(await valid.check())) return validationFailedRes(res, valid);

            const { channelId, socialLinkId, platform, description, url } = req.body;

            const channel = await Channel.findById(channelId).select("socialLinks");
            if (!channel) return failed(res, {}, "Channel not found", 404);

            const socialLinkIndex = channel.socialLinks.findIndex(link => link._id.toString() === socialLinkId);
            if (socialLinkIndex === -1) return failed(res, {}, "Social Link not found", 404);

            // Update only specified fields
            channel.socialLinks[socialLinkIndex].platform = platform;
            channel.socialLinks[socialLinkIndex].description = description;
            channel.socialLinks[socialLinkIndex].url = url;
            channel.socialLinks[socialLinkIndex].logo = req.files?.logo
                ? fileUpload(req.files.logo, `${platform}-${socialLinkId}-logo`)
                : channel.socialLinks[socialLinkIndex].logo;

            await channel.save();

            return success(res, channel.socialLinks[socialLinkIndex], "Social Link updated successfully!");
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

}