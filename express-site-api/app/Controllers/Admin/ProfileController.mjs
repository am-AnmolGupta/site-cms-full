import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import mongoose from "mongoose";
import { Channel } from "../../Models/Channel.mjs";
import { Profile } from '../../Models/Profile.mjs';
import { fileUpload } from '../../Helper/util.mjs';
export class ProfileController {
    static async profiles(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const profiles = await Profile.paginate({}, { page, limit, sort: { createdAt: -1 } });

            return success(res, "Profiles list", profiles, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async addEditProfile(req, res) {
        try {
            const { profileId, status, slug } = req.body;

            const valid = new Validator(req.body, {
                title: "required",
                slug: "required",
            });
            if (!(await valid.check())) return validationFailedRes(res, valid);

            req.body.deletedAt = status === "inactive" ? new Date() : null;


            if (profileId) {
                const existingProfile = await Profile.findById(profileId);
                if (!existingProfile) return failed(res, {}, "Profile not found", 404);

                // Retain existing values if no new file is uploaded
                req.body.image = req.files?.image
                    ? fileUpload(req.files.image, `${slug}-logo`)
                    : existingProfile.image || "";

            } else {
                // Handle cases where profileId is not provided (New profile creation)
                req.body.image = req.files?.image ? fileUpload(req.files.image, `${slug}-logo`) : "";
            }


            let profile;
            if (profileId && mongoose.Types.ObjectId.isValid(profileId)) {
                profile = await Profile.findByIdAndUpdate(profileId, req.body, { new: true });
                if (!profile) return failed(res, {}, "Profile not found", 404);
            } else {
                profile = await Profile.create(req.body);
            }

            const message = profileId ? "Profile updated successfully!" : "Profile added successfully!";
            return success(res, message, profile);

        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async profileSocialLinks(req, res) {
        try {
            const valid = new Validator(req.query, {
                profileId: "required",
            });
            if (!(await valid.check())) return validationFailedRes(res, valid);
            const { profileId } = req.query;
            const profileSocialLinks = await Profile.findById(profileId, "socialLinks");

            return success(res, "Profile Social Links list", profileSocialLinks, 200);
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
                profileId: "required",
                socialLinks: "required|array",
            });

            if (!(await valid.check())) return validationFailedRes(res, valid);

            const { profileId } = req.body;
            const profile = await Profile.findById(profileId);

            if (!profile) return failed(res, {}, "Profile not found", 404);

            // Append new social links while avoiding duplicates
            profile.socialLinks = [...(profile.socialLinks || []), ...socialLinks];
            await profile.save();

            return success(res, profile, "Social links updated successfully");
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async editSocialLinks(req, res) {
        try {
            const valid = new Validator(req.body, {
                profileId: "required",
                socialLinkId: "required",
                platform: "required",
                description: "required",
                url: "required",
            });

            if (!(await valid.check())) return validationFailedRes(res, valid);

            const { profileId, socialLinkId, platform, description, url } = req.body;

            const profile = await Profile.findById(profileId).select("socialLinks");
            if (!profile) return failed(res, {}, "Profile not found", 404);

            const socialLinkIndex = profile.socialLinks.findIndex(link => link._id.toString() === socialLinkId);
            if (socialLinkIndex === -1) return failed(res, {}, "Social Link not found", 404);

            // Update only specified fields
            profile.socialLinks[socialLinkIndex].platform = platform;
            profile.socialLinks[socialLinkIndex].description = description;
            profile.socialLinks[socialLinkIndex].url = url;
            profile.socialLinks[socialLinkIndex].logo = req.files?.logo
                ? fileUpload(req.files.logo, `${platform}-${socialLinkId}-logo`)
                : profile.socialLinks[socialLinkIndex].logo;

            await profile.save();

            return success(res, profile.socialLinks[socialLinkIndex], "Social Link updated successfully!");
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
}