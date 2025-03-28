import express from 'express';
const apiRouter = express.Router();

import { failed } from '../app/Helper/response.mjs';
import { ProfileController } from '../app/Controllers/Api/ProfileController.mjs';
// apiRouter.get("/sitemap", SitemapController.brandSitemap);

// apiRouter.use(CacheMiddleware);

apiRouter.get('/get-profiles', ProfileController.getProfiles);


// //sitemap controller routes

apiRouter.use((req, res, next) => {
  return failed(res, "API endpoint not found", 404);
});
export { apiRouter };
