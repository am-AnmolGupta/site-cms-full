import express from 'express';
const apiRouter = express.Router();

// import { failed } from '../app/Helper/response.mjs';

// import { BrandController } from "../app/Controllers/Api/BrandController.mjs";

// import { SitemapController } from "../app/Controllers/Api/SitemapController.mjs";
// import { ImageController } from '../app/Controllers/Api/ImageController.mjs';
// import { CacheMiddleware } from "../app/Middleware/CacheMiddleware.mjs"

// apiRouter.get("/upload/aws-image-fix", UploadController.fixS3Images);
// apiRouter.get("/thumb/:key", ImageController.imageCrop);
// apiRouter.get("/sitemap", SitemapController.brandSitemap);

// apiRouter.use(CacheMiddleware);

// //Brand controller routes
// apiRouter.get("/brand/detail", BrandController.getBrandDetail);
// apiRouter.get("/brand/upcoming/models", BrandController.upcomingModels);
// apiRouter.get("/brand/highlights", BrandController.brandKeyHighlights);
// apiRouter.get("/brand/discontinued/models", BrandController.discontinuedModels);



// //sitemap controller routes

// apiRouter.use((req, res, next) => {
//     return failed(res, "API endpoint not found", 404);
// });
export { apiRouter };
