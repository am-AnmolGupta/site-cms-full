
import jwt from 'jsonwebtoken';
import { failed } from '../Helper/response.mjs';

export const AdminOrSuperAdminRoleMiddleware = (req, res, next) => {
    try {
        if (req.headers['authorization']) {
            const token = req.body.token || req.query.token || req.headers['authorization'].split(' ')[1];
            var decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (decoded.roles.includes("superadmin") || decoded.roles.includes("admin")) {
                return next();
            } else {
                return failed(res, "Access Forbidden!", 403);
            }
        }
    } catch (error) {

    }

};
