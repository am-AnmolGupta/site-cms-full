import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import { StaticPage } from "../../Models/StaticPage.mjs";
import mongoose from "mongoose";
export class StaticPageController {
  static async staticPages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const channelId = req.query.channelId;
      const staticPages = await StaticPage.paginate(
        { channelId: channelId },
        { projection: { _id: 1, title: 1, description: 1, slug: 1, createdAt: 1, updatedAt: 1, deletedAt: 1 } },
        { page, limit }
      );

      return success(res, "Static Pages list", staticPages, 200);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
  static async addEditStaticPage(req, res) {
    try {
      const valid = new Validator(req.body, {
        title: "required",
        slug: "required",
      });
      if (!(await valid.check())) return validationFailedRes(res, valid);
      const { channelId, staticPageId, status } = req.body;

      req.body.deletedAt = status === "inactive" ? new Date() : null;

      if (staticPageId) {
        const existingStaticPage = await StaticPage.findById(staticPageId);
        if (!existingStaticPage) return failed(res, {}, "Static Page not found", 404);

        req.body.seoImage = req.files?.seoImage
          ? fileUpload(req.files.seoImage, `${slug}-seo-image`)
          : existingStaticPage.seoImage || "";
      } else {
        req.body.seoImage = req.files?.seoImage ? fileUpload(req.files.seoImage, `${slug}-seo-image`) : "";
      }

      let staticPage;
      if (staticPageId && mongoose.Types.ObjectId.isValid(staticPageId)) {
        staticPage = await StaticPage.findByIdAndUpdate(staticPageId, req.body, { new: true });
        if (!staticPage) return failed(res, {}, "Static Page not found", 404);
      } else {
        staticPage = await StaticPage.create(req.body);
      }

      const message = staticPageId ? "Static Page updated successfully!" : "Static Page added successfully!";
      return success(res, message, staticPage);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
}