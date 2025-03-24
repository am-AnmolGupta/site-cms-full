import { Admin } from "../../Models/Admin.mjs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { success, failed } from "../../Helper/response.mjs";
import { sendMail } from "../../Helper/forgotPassword.mjs"
import logger from '../../Helper/logger.mjs';

export class AuthController {

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const admin = await Admin.findOne({ email });

            if (!admin) {
                return failed(res, 'user does not exist', 400);
            }
            if (admin && (await bcrypt.compare(password, admin.password))) {
                const token = jwt.sign({
                    id: admin._id,
                    roles: admin.roles
                },
                    process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: "500h",
                },
                );
                var data = {
                    "token": token,
                    "role": admin.roles
                };
                return success(res, "login success!", data);
            }
            return failed(res, 'Incorrect password', 400);
        } catch (error) {
            return failed(res, error.message, 100);
        }

    }
    static async refreshToken(req, res) {
        try {
            const decoded = jwt.verify(req.body.token, process.env.ACCESS_TOKEN_SECRET);
            var token;
            if (decoded) {
                token = jwt.sign({
                    id: decoded.id,
                    roles: decoded.roles
                },
                    process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: "500h",
                },
                );
                return success(res, "refresh token!", token);
            } else {
                return failed(res, 'token is not correct!', 400);
            }
        }
        catch (error) {
            return failed(res, error.message, 100);
        }
    }
    static async forgotPassword(req, res) {
        try {
            const encodedEmail = Buffer.from(req.body.email).toString('base64');
            const encodedTimestamp = Buffer.from(Date.now().toString()).toString('base64');
            const url = `${process.env.ADMIN_URL}/admin/update/password/${encodedEmail}/${encodedTimestamp}`;
            sendMail(url);
            return success(res, "password reset link send!", url);

        } catch (error) {
            return failed(res, error.message, 100);
        }
    }
    static async updatePassword(req, res) {
        try {
            const decodedEmail = Buffer.from(req.body.email, 'base64').toString();
            const decodedTimestamp = Buffer.from(req.body.timestamp, 'base64').toString();
            const timeDiff = Date.now() - decodedTimestamp;
            const minutesDiff = timeDiff / 60;
            console.log(bcrypt.hashSync(req.body.password, 12));
            const update = await Admin.findOneAndUpdate({ email: decodedEmail }, { password: bcrypt.hashSync(req.body.password, 12) });
            return success(res, "password has been updated!");
        } catch (error) {
            return failed(res, error.message, 100);
        }
    }

}