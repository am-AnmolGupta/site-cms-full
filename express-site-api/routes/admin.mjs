import express from 'express';
const adminRouter = express.Router();

import { AdminController } from "../app/Controllers/Admin/AdminController.mjs";
import { AuthController } from "../app/Controllers/Admin/AuthController.mjs";
import { BrandController } from "../app/Controllers/Admin/BrandController.mjs";
import { ModelController } from "../app/Controllers/Admin/ModelController.mjs";
import { VariantController } from "../app/Controllers/Admin/VariantController.mjs";
import { AttributeController } from '../app/Controllers/Admin/AttributeController.mjs';
import { SpecificationController } from '../app/Controllers/Admin/SpecificationController.mjs';
import { FaqController } from '../app/Controllers/Admin/FaqController.mjs';
import { MediaController } from '../app/Controllers/Admin/MediaController.mjs';
import { CheckAuthMiddleware } from "../app/Middleware/CheckAuthMiddleware.mjs";
import { AdminOrSuperAdminRoleMiddleware } from '../app/Middleware/AdminOrSuperAdminRoleMiddleware.mjs';
import { SuperAdminRoleMiddleware } from "../app/Middleware/SuperAdminRoleMiddleware.mjs";
import { DashboardController } from "../app/Controllers/Admin/DashboardController.mjs";
import { ModuleController } from '../app/Controllers/Admin/ModuleController.mjs';
import { LogController } from '../app/Controllers/Admin/LogController.mjs';
import { UploadController } from '../app/Controllers/Admin/UploadController.mjs';

adminRouter.post("/login", AuthController.login);
adminRouter.post("/forgot/password/", AuthController.forgotPassword);
adminRouter.post("/update/password", AuthController.updatePassword);

adminRouter.use(CheckAuthMiddleware);

adminRouter.post("/refresh/token", AuthController.refreshToken);

adminRouter.use(AdminOrSuperAdminRoleMiddleware);
adminRouter.post("/add/brand", BrandController.addBrand);
adminRouter.get("/brands", BrandController.brandList);

adminRouter.post("/add/model", ModelController.addModel);
adminRouter.post("/models", ModelController.modelList);

adminRouter.post("/add/variant", VariantController.addVariant);
adminRouter.post("/variants", VariantController.variantList);

adminRouter.post("/add/attribute", AttributeController.addEditAttribute);
adminRouter.get("/attributes", AttributeController.attributeList);
adminRouter.post("/attribute/details", AttributeController.getAttributeDetails);
adminRouter.get("/get/attributes", AttributeController.getAttributes);
adminRouter.post("/attribute/types", AttributeController.getAttributetypes);
adminRouter.post("/attribute/values", AttributeController.getAttributeValues);

adminRouter.post("/add/specification", SpecificationController.addEditSpecification);
adminRouter.post("/specifications", SpecificationController.specificationList);
adminRouter.post("/bulk-add/specification", SpecificationController.bulkAddSpecification);

adminRouter.post("/add/faq", FaqController.addEditFaq);
adminRouter.post("/faq", FaqController.faqList);
adminRouter.post("/edit/faq", FaqController.editFaq);

adminRouter.post("/add/media", MediaController.addMedia);
adminRouter.post("/edit/media", MediaController.editMedia);
adminRouter.post("/media", MediaController.mediaList);

adminRouter.get("/dashboard", DashboardController.getDashboard);
adminRouter.post("/module/details", ModuleController.moduleDetail);
adminRouter.get("/search", DashboardController.globalSearch);

adminRouter.use(SuperAdminRoleMiddleware);

adminRouter.get("/users", AdminController.users);
adminRouter.post("/add-user", AdminController.addUser);

adminRouter.post("/add-role", AdminController.addRole);
adminRouter.get("/roles", AdminController.roleList);
adminRouter.get("/log", LogController.getLog);

adminRouter.post("/upload/attribute", UploadController.uploadAttribute);
adminRouter.post("/upload/brand", UploadController.uploadBrand);
adminRouter.post("/upload/model", UploadController.uploadModel);
adminRouter.post("/upload/variant", UploadController.uploadVariant);
adminRouter.post("/upload/specification", UploadController.uploadSpecification);
adminRouter.post("/upload/fix-variants", UploadController.fixVariantName);
adminRouter.post("/upload/fix-specification", UploadController.fixSpecificationName);
adminRouter.post("/upload/fix-mapping-variants", UploadController.fixVariantMappingName);
adminRouter.post("/upload/variant-description", UploadController.updateVariantDescriptions);
adminRouter.post("/upload/fix-duplicate-specification", UploadController.fixDuplicateSpecification);
adminRouter.get("/generate-variant-description", VariantController.generateVariantDescription);
export { adminRouter };
