import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import mongoose from "mongoose";
import { Channel } from '../../Models/Channelw.mjs';

export class ChannelController {

    static async addChannel(req, res) {
        try {
            let isExist = await Channel.findOne({ email: req.body.email });
            if (isExist && !req.body.hasOwnProperty('userId')) {
                return success(res, "user already exist!");
            }
            const valid = new Validator(req.body, {
                name: 'required',
                email: 'required|email',
                roles: 'required|array',
            });
            const matched = await valid.check()
            if (!matched)
                return validationFailedRes(res, valid);
            if (req.body.status) {
                req.body.deletedAt = (req.body.status == 'inactive') ? new Date() : null;
            }
            if (!isExist) {
                const hashedPassword = await bcrypt.hash(req.body.email, 12);
                req.body.password = hashedPassword;
            }
            if (req.body.userId) {
                const filter = { _id: mongoose.Types.ObjectId(req.body.userId) };
                await Channel.findOneAndUpdate(filter, req.body);
                return success(res, "user updated successfully!");

            } else {
                await Channel.create(req.body);
                return success(res, "user added successfully!");
            }

        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
    static async channels(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const users = await Channel.paginate({}, { page, limit });
            //const users = await Channel.find();
            return success(res, "users list", users, 200);
        } catch (error) {
            return failed(res, {}, error.message, 400);
        }
    }
}