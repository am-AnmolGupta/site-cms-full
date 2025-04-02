import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import { StaticPage } from "../../Models/StaticPage.mjs";
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
}