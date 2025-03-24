import express from 'express';
const apiRouter = express.Router();

import { failed } from '../app/Helper/response.mjs';

import { BrandController } from "../app/Controllers/Api/BrandController.mjs";
import { ModelController } from "../app/Controllers/Api/ModelController.mjs";
import { VariantController } from "../app/Controllers/Api/VariantController.mjs";
import { CommonController } from "../app/Controllers/Api/CommonController.mjs";
import { SitemapController } from "../app/Controllers/Api/SitemapController.mjs";
import { ImageController } from '../app/Controllers/Api/ImageController.mjs';
import { CacheMiddleware } from "../app/Middleware/CacheMiddleware.mjs"
import { UploadController } from '../app/Controllers/Admin/UploadController.mjs';

apiRouter.get("/upload/aws-image-fix", UploadController.fixS3Images);
apiRouter.get("/thumb/:key", ImageController.imageCrop);
apiRouter.get("/sitemap", SitemapController.brandSitemap);

apiRouter.use(CacheMiddleware);

//Brand controller routes
apiRouter.get("/brand/detail", BrandController.getBrandDetail);
apiRouter.get("/brand/upcoming/models", BrandController.upcomingModels);
apiRouter.get("/brand/highlights", BrandController.brandKeyHighlights);
apiRouter.get("/brand/discontinued/models", BrandController.discontinuedModels);

//Model controller routes
apiRouter.get("/model/detail", ModelController.getModelDetail);
apiRouter.get("/model/specifications", ModelController.featureAndSpecification);
apiRouter.get("/model/variants", ModelController.variantList);
apiRouter.get("/popular/models", ModelController.popularModels);
apiRouter.get("/popular/cars", ModelController.popularCars);
apiRouter.get("/filter/models", ModelController.filterModels);

//Variant controller routes
apiRouter.get("/variant/detail", VariantController.getVariantDetail);
apiRouter.get("/variant/specifications", VariantController.featureAndSpecification);
apiRouter.get("/filter/variants", VariantController.filterVariants);

//Common controller routes
apiRouter.get("/list", CommonController.moduleListing);
apiRouter.get("/reviews", CommonController.review);
apiRouter.get("/faqs", CommonController.faq);
apiRouter.get("/medias", CommonController.media);
apiRouter.get("/model/update", CommonController.modelUpdate);
apiRouter.get("/all/reviews", CommonController.allReviews);

//sitemap controller routes

apiRouter.use((req, res, next) => {
    return failed(res, "API endpoint not found", 404);
});
export { apiRouter };
