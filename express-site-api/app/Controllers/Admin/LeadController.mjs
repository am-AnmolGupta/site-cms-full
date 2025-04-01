import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import mongoose from "mongoose";
import { Lead } from "../../Models/Lead.mjs";
export class LeadsController {
  static async leads(req, res) {
    try {
      const valid = new Validator(req.query, {
        channelId: "required",
      });
      if (!(await valid.check())) return validationFailedRes(res, valid);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const { channelId } = req.query;
      const leads = await Lead.paginate({ channelId: channelId }, {}, { page, limit, });

      return success(res, "role list", leads, 200);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
}