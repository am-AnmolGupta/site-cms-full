import express from 'express';
const adminRouter = express.Router();

import { AdminController } from "../app/Controllers/Admin/AdminController.mjs";
import { AuthController } from "../app/Controllers/Admin/AuthController.mjs";

import { CheckAuthMiddleware } from "../app/Middleware/CheckAuthMiddleware.mjs";
import { AdminRoleMiddleware } from "../app/Middleware/AdminRoleMiddleware.mjs";
import { LogController } from '../app/Controllers/Admin/LogController.mjs';

import { ChannelController } from '../app/Controllers/Admin/ChannelController.mjs';
import { ModuleController } from '../app/Controllers/Admin/ModuleController.mjs';

adminRouter.post("/login", AuthController.login);
adminRouter.post("/forgot/password/", AuthController.forgotPassword);
adminRouter.post("/update/password", AuthController.updatePassword);

adminRouter.post("/module/details", ModuleController.moduleDetail);

adminRouter.get("/channels", ChannelController.channels);
adminRouter.post("/add-edit-channel", ChannelController.addEditChannel);
adminRouter.get("/channel-social-links", ChannelController.channelSocialLinks);
adminRouter.post("/add-social-links", ChannelController.addSocialLinks);
adminRouter.post("/edit-social-link", ChannelController.editSocialLinks);

adminRouter.use(CheckAuthMiddleware);

adminRouter.post("/refresh/token", AuthController.refreshToken);




adminRouter.use(AdminRoleMiddleware);

adminRouter.get("/users", AdminController.users);
adminRouter.post("/add-user", AdminController.addUser);

adminRouter.post("/add-role", AdminController.addRole);
adminRouter.get("/roles", AdminController.roleList);
adminRouter.get("/log", LogController.getLog);


export { adminRouter };
