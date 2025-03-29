import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import mongoose from "mongoose";
import { User } from "../../Models/User.mjs";
import { fileUpload } from '../../Helper/util.mjs';
export class UserController {

  static async users(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const users = await User.paginate({}, { page, limit, sort: { createdAt: -1 } });

      return success(res, "User list", users, 200);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
}