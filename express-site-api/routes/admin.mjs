import express from 'express';
const adminRouter = express.Router();

import { AdminController } from "../app/Controllers/Admin/AdminController.mjs";
import { AuthController } from "../app/Controllers/Admin/AuthController.mjs";

import { CheckAuthMiddleware } from "../app/Middleware/CheckAuthMiddleware.mjs";
import { AdminRoleMiddleware } from "../app/Middleware/AdminRoleMiddleware.mjs";
import { LogController } from '../app/Controllers/Admin/LogController.mjs';

import { ChannelController } from '../app/Controllers/Admin/ChannelController.mjs';
import { ModuleController } from '../app/Controllers/Admin/ModuleController.mjs';
import { ProfileController } from '../app/Controllers/Admin/ProfileController.mjs';
import { UserController } from '../app/Controllers/Admin/UserController.mjs';
import { LeadsController } from '../app/Controllers/Admin/LeadController.mjs';

adminRouter.post("/login", AuthController.login);
adminRouter.post("/forgot/password/", AuthController.forgotPassword);
adminRouter.post("/update/password", AuthController.updatePassword);

adminRouter.post("/module/details", ModuleController.moduleDetail);

adminRouter.get("/channels", ChannelController.channels);
adminRouter.post("/add-edit-channel", ChannelController.addEditChannel);
adminRouter.get("/channel-social-links", ChannelController.channelSocialLinks);
adminRouter.post("/add-channel-social-links", ChannelController.addSocialLinks);
adminRouter.post("/edit-channel-social-link", ChannelController.editSocialLinks);

adminRouter.get("/profiles", ProfileController.profiles);
adminRouter.post("/add-edit-profile", ProfileController.addEditProfile);
adminRouter.get("/profile-social-links", ProfileController.profileSocialLinks);
adminRouter.post("/add-profile-social-links", ProfileController.addSocialLinks);
adminRouter.post("/edit-profile-social-link", ProfileController.editSocialLinks);
// adminRouter.use(CheckAuthMiddleware);

adminRouter.post("/refresh/token", AuthController.refreshToken);

adminRouter.get("/users", UserController.users);
adminRouter.post("/add-edit-user", UserController.addEditUser);

adminRouter.get("/leads", LeadsController.leads);


// adminRouter.use(AdminRoleMiddleware);

adminRouter.get("/admins", AdminController.users);
adminRouter.post("/add-edit-admin", AdminController.addUser);

adminRouter.post("/add-edit-role", AdminController.addEditRole);
adminRouter.get("/roles", AdminController.roleList);
adminRouter.get("/log", LogController.getLog);


export { adminRouter };
