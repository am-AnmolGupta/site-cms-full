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
}