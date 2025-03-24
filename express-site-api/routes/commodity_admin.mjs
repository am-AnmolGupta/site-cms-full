import express from 'express';
const commodityAdminRouter = express.Router();

import { CommodityController } from '../app/Controllers/CommodityAdmin/CommodityController.mjs';
import { CommodityContentGenerateController } from '../app/Controllers/CommodityAdmin/CommodityContentGenerateController.mjs';


commodityAdminRouter.get("/commodities", CommodityController.commodityList);
commodityAdminRouter.post("/module/details", CommodityController.moduleDetail);
commodityAdminRouter.post("/add/commodities", CommodityController.addEditCommodity);
commodityAdminRouter.post("/daily-updates", CommodityController.dailyUpdatesList);
commodityAdminRouter.post("/add/daily-updates", CommodityController.addEditDailyUpdate);
commodityAdminRouter.post("/top-content", CommodityController.topContentList);
commodityAdminRouter.post("/add/top-content", CommodityController.addEditTopContent);
commodityAdminRouter.post("/faqs", CommodityController.faqsList);
commodityAdminRouter.post("/add/faqs", CommodityController.addFAQ);
commodityAdminRouter.post("/edit/faqs", CommodityController.editFAQ);
commodityAdminRouter.get("/generate-daily-update-content", CommodityContentGenerateController.getDailyUpdateContent);
commodityAdminRouter.get("/generate-top-content", CommodityContentGenerateController.getTopContent);
commodityAdminRouter.get("/generate-seo-meta", CommodityContentGenerateController.getSeoMeta);
commodityAdminRouter.get("/sync-seo-meta", CommodityContentGenerateController.syncSeoMeta);
commodityAdminRouter.get("/daily-update-format", CommodityController.dailyUpdateFormatList);
commodityAdminRouter.get("/top-content-format", CommodityController.topContentFormatList);
commodityAdminRouter.post("/add/top-content-format", CommodityController.addEditTopContentFormat);
commodityAdminRouter.post("/add/daily-update-format", CommodityController.addEditDailyUpdateFormat);
commodityAdminRouter.get("/get-city", CommodityController.getCommodityCity);
commodityAdminRouter.post("/clear-cache", CommodityController.clearCache);

export { commodityAdminRouter };
