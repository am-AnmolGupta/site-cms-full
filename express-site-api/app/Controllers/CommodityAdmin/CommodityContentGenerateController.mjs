import { Validator } from 'node-input-validator';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage, notFoundMessage } from "../../Helper/response.mjs";
import { generateDailyUpdateContent } from '../../Helper/commodityDailyUpdateHelper.mjs';
import { generateTopContent } from '../../Helper/commodityTopContentHelper.mjs';
import { generateSeoMeta } from '../../Helper/commoditySeoMetaHelper.mjs';
import { CommoditiesStaticContent } from '../../Models/Commodities/CommoditiesStaticContent.mjs';
import { CommoditiesTopContentFormat } from '../../Models/Commodities/CommoditiesTopContentFormat.mjs';
import logger from '../../Helper/logger.mjs';
import { getTopContentFormat } from '../../Helper/commodityTopContentHelper.mjs';
export class CommodityContentGenerateController {
  static async getDailyUpdateContent(req, res) {
    try {
      const valid = new Validator(req.query, {
        'name': 'required',
        'city': 'required',
        'date': 'required',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, city, date } = req.query;
      console.log({ name, city, date });

      const content = await generateDailyUpdateContent(name, city, date);
      return success(res, "Daily Update Content", content);

    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }

  static async getTopContent(req, res) {
    try {
      const valid = new Validator(req.query, {
        'name': 'required',
        'city': 'required',
      });
      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);
      const { name, city } = req.query;

      const content = await generateTopContent(name, city);
      return success(res, "Daily Update Content", content);

    } catch (error) {
      console.log(error);
      return failed(res, {}, error.message, 400);
    }
  }

  static async getSeoMeta(req, res) {
    try {
      const valid = new Validator(req.query, {
        'name': 'required',
        'city': 'required',
      });
      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);
      const { name, city } = req.query;

      const seoMeta = await generateSeoMeta(name, city);
      return success(res, "SEO Meta Content", seoMeta);

    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
  static async syncSeoMeta(req, res) {
    try {
      const valid = new Validator(req.query, {
        'name': 'required',
      });
      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);
      const { name } = req.query;
      let commodities;
      if (name === "all") {
        commodities = await CommoditiesStaticContent.findAll();
      } else {
        commodities = await CommoditiesStaticContent.findAll({ where: { name } });
      }
      if (!commodities || commodities.length === 0) {
        return notFoundMessage(res, "No commodities found");
      }

      const updatePromises = commodities.map(async (commodity) => {
        try {
          const seoMeta = await generateSeoMeta(commodity.name, commodity.city);
          await CommoditiesStaticContent.update(
            { seo_title: seoMeta.seo_title, seo_description: seoMeta.seo_description, seo_keywords: seoMeta.seo_keywords },
            { where: { name: commodity.name, city: commodity.city } }
          );
          logger.info(`SEO Meta updated for commodity: ${commodity.name}, ${commodity.city}`);
        } catch (updateError) {
          logger.error(`Failed to update SEO Meta for commodity: ${commodity.name}, ${commodity.city} - ${updateError.message}`);
        }
      });

      await Promise.all(updatePromises);
      return success(res, "SEO Meta Content updated successfully");

    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
  static async syncTopContent() {
    try {
      const commodities = await CommoditiesStaticContent.findAll({ where: { is_top_content_edited: true } });

      if (!commodities.length) {
        logger.warn("No commodities found");
        return;
      }

      const updatePromises = commodities.map(async ({ name, city }) => {
        try {

          await CommoditiesStaticContent.upsert({
            name,
            city,
            editor_top_content: null,
            is_top_content_edited: false,
            editor_top_content_updatedAt: null
          });

          logger.info(`Top Content updated for commodity: ${name}, ${city}`);
        } catch (error) {
          logger.error(`Failed to update Top Content for ${name}, ${city}: ${error.message}`);
        }
      });

      await Promise.all(updatePromises);

      logger.info("Top Content format update process completed");
    } catch (error) {
      logger.error(`syncTopContent failed: ${error.message}`);
    }
  }
}
