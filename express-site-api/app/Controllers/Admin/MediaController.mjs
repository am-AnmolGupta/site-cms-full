import { Media } from "../../Models/Media.mjs";
import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage } from "../../Helper/response.mjs";
import { fileUpload } from "../../Helper/util.mjs";
import mongoose from 'mongoose';

export class MediaController {
    static async addMedia(req, res) {
        try {
            const valid = new Validator(req.body, {
                moduleId: 'required',
                moduleType: 'required|in:brand,model,variant',
            });
            const matched = await valid.check();
            if (!matched) {
                return validationFailedRes(res, valid);
            }

            req.body.medias = JSON.parse(req.body.medias);
            req.body.medias.forEach((element, index) => {
                element.source_path = (element.media_type == 'image' ? fileUpload(req.files[`file_${index}`], `${req.body.moduleType}-media`) : element.source_path);
            });

            var isExist = await Media.findOne({ moduleId: req.body.moduleId, moduleType: req.body.moduleType });
            if (isExist) {
                var media_array = isExist.medias.concat(req.body.medias);
                isExist.medias = media_array; // Update medias in the found document
                await isExist.save(); // Save the modified document to trigger the pre('save') middleware
                return success(res, "Media added successfully!");
            } else {
                await Media.create(req.body);
                return success(res, "Media added successfully!");
            }

        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

    static async editMedia(req, res) {
        try {
            const { moduleId, mediaId, media } = req.body;
            const updatedMedia = JSON.parse(media);

            if (updatedMedia.status === 'inactive') {
                const result = await Media.findOneAndUpdate(
                    { moduleId, "medias._id": mediaId },
                    { $set: { "medias.$.deletedAt": new Date() } },
                    { new: true }
                );

                if (!result) {
                    return failed(res, {}, "Media not found", 404);
                }

                return success(res, "Media marked as inactive successfully!");
            } else {
                if (updatedMedia.media_type === 'image' && req.files) {
                    updatedMedia.source_path = await fileUpload(req.files.file);
                }

                // Update thumbnail URL here
                if (["youtube", "youtube_review"].includes(updatedMedia.media_type)) {
                    updatedMedia.thumbnail = `https://img.youtube.com/vi/${updatedMedia.thumbnail_video_id}/maxresdefault.jpg`;
                }

                const result = await Media.findOneAndUpdate(
                    { moduleId, "medias._id": mediaId },
                    {
                        $set: {
                            "medias.$.title": updatedMedia.title,
                            "medias.$.source_path": updatedMedia.source_path,
                            "medias.$.media_type": updatedMedia.media_type,
                            "medias.$.seo_title": updatedMedia.seo_title,
                            "medias.$.seo_description": updatedMedia.seo_description,
                            "medias.$.thumbnail_video_id": updatedMedia.thumbnail_video_id,
                            "medias.$.thumbnail": updatedMedia.thumbnail, // Update thumbnail URL
                            "medias.$.deletedAt": null,
                        },
                    },
                    { new: true }
                );

                if (!result) {
                    return failed(res, {}, "Media not found", 404);
                }

                return success(res, "Media updated successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async mediaList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 2;
            const models = await Media.paginate({ moduleId: req.body.moduleId }, { page, limit });
            return success(res, "media list", models, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }

}