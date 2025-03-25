import express from 'express';
const adminRouter = express.Router();

import { AdminController } from "../app/Controllers/Admin/AdminController.mjs";
import { AuthController } from "../app/Controllers/Admin/AuthController.mjs";
import { BrandController } from "../app/Controllers/Admin/BrandController.mjs";

import { CheckAuthMiddleware } from "../app/Middleware/CheckAuthMiddleware.mjs";
import { AdminRoleMiddleware } from "../app/Middleware/AdminRoleMiddleware.mjs";
import { LogController } from '../app/Controllers/Admin/LogController.mjs';

adminRouter.post("/login", AuthController.login);
adminRouter.post("/forgot/password/", AuthController.forgotPassword);
adminRouter.post("/update/password", AuthController.updatePassword);

adminRouter.use(CheckAuthMiddleware);

adminRouter.post("/refresh/token", AuthController.refreshToken);

adminRouter.post("/add/brand", BrandController.addBrand);
adminRouter.get("/brands", BrandController.brandList);



adminRouter.use(AdminRoleMiddleware);

adminRouter.get("/users", AdminController.users);
adminRouter.post("/add-user", AdminController.addUser);

adminRouter.post("/add-role", AdminController.addRole);
adminRouter.get("/roles", AdminController.roleList);
adminRouter.get("/log", LogController.getLog);


export { adminRouter };
