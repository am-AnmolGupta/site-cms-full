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
  static async addEditUser(req, res) {
    try {
      const valid = new Validator(req.body, {
        userId: "required",
        email: "requiredWithout:mobile",
        mobile: "requiredWithout:email"
      });

      if (!(await valid.check())) {
        return validationFailedRes(res, valid);
      }

      const { userId, email, mobile } = req.body;
      const userDetail = await User.findById(userId);

      if (!userDetail) {
        return failed(res, {}, "User not found", 404);
      }

      req.body.image = req.files?.image
        ? fileUpload(req.files.image, `user-${email ?? mobile}-logo`)
        : userDetail.image || "";

      const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

      return success(res, "User updated successfully", updatedUser);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
}