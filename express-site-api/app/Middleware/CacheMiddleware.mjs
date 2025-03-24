
import { getData, saveDataToCache, getKey } from '../Helper/cache.mjs';
import express from 'express';
const app = express();
const config = process.env;
export const CacheMiddleware = async (req, res, next) => {
   const oldSend = res.send;

   res.send = function (body) {
      res.locals.body = body;
      return oldSend.apply(res, arguments);
   };
   var data = await getData(getKey(req.url));

   if (data) {
      // console.log('ss',app.locals.cache_driver);
      //  console.log('Returning from Cache');
      res.json(JSON.parse(data));
      return;
   }
   else {
      res.on('finish', () => {
         // console.log('Caching Response content:', res.locals.body.length);
         saveDataToCache(res.locals.body, getKey(req.url));
      });
      next();
   }
}