import { Admin } from "../../Models/Admin.mjs";
import { Validator } from 'node-input-validator';
import { Role } from "../../Models/Role.mjs";
import bcrypt from 'bcryptjs';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import mongoose from "mongoose";
export class AdminController {

    static async addUser(req, res) {
        try {
            const valid = new Validator(req.body, {
                name: 'required',
                email: 'required|email',
                roles: 'required',
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            if (req.body.status) {
                req.body.deletedAt = (req.body.status == 'inactive') ? new Date() : null;
            }
            const { adminId } = req.body;
            req.body.roles = JSON.parse(req.body.roles);
            if (adminId) {
                const filter = { _id: mongoose.Types.ObjectId(adminId) };
                await Admin.findOneAndUpdate(filter, req.body);
                return success(res, "user updated successfully!");

            } else {
                const hashedPassword = await bcrypt.hash(req.body.email, 12);
                req.body.password = hashedPassword;
                await Admin.create(req.body);
                return success(res, "user added successfully!");
            }

        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async users(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const users = await Admin.paginate({}, { page, limit });
            //const users = await Admin.find();
            return success(res, "users list", users, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async addEditRole(req, res) {
        try {
            const valid = new Validator(req.body, {
                role: 'required'
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            if (req.body.status == "inactive") {
                req.body.deletedAt = new Date()
            }
            const { roleId } = req.body;
            if (roleId) {
                await Role.findByIdAndUpdate(roleId, req.body, { new: true });
                return success(res, "role updated successfully!");
            } else {
                await Role.create(req.body);
                return success(res, "role added successfully!");
            }
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async roleList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const pagination = req.query.pagination;
            let roles;
            if (!pagination) {
                roles = await Role.paginate({}, { page, limit });
            } else {
                roles = await Role.find();
            }

            return success(res, "role list", roles, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
}