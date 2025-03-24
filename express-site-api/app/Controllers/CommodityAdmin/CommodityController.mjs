import { Validator } from 'node-input-validator';
import { CommoditiesStaticContent } from '../../Models/Commodities/CommoditiesStaticContent.mjs';
import { success, failed, customValidationFailed, validationFailedRes, customFailedMessage, notFoundMessage } from "../../Helper/response.mjs";
import { CommoditiesDailyUpdates } from '../../Models/Commodities/CommoditiesDailyUpdates.mjs';
import { CommoditiesFAQ } from '../../Models/Commodities/CommoditiesFAQ.mjs';
import { Sequelize, Op } from 'sequelize';
import moment from 'moment-timezone';
import { CommoditiesDailyUpdatesFormat } from '../../Models/Commodities/CommoditiesDailyUpdatesFormat.mjs';
import { CommoditiesTopContentFormat } from '../../Models/Commodities/CommoditiesTopContentFormat.mjs';
import { CommoditiesMaster } from '../../Models/Commodities/CommoditiesMaster.mjs';
import logger from '../../Helper/logger.mjs';
import fetch from 'node-fetch';
export class CommodityController {
  static async addEditCommodity(req, res) {
    try {
      console.log(req.body)
      const valid = new Validator(req.body, {
        name: 'required|string',
        city: 'required|string',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, city } = req.body;
      console.log(name, city)
      req.body.deletedAt = req.body.status === 'inactive' ? new Date() : null;

      const existingCommodity = await CommoditiesStaticContent.findOne({
        where: { name, city },
        paranoid: false,
      });


      if (existingCommodity) {
        console.log(req.body);
        await CommoditiesStaticContent.update(
          { ...req.body },
          {
            where: { city, name },
            paranoid: false,
          }
        );

        await CommodityController.clearCacheByNameAndCity(name, city);

        return success(res, 'Commodity updated successfully!');
      } else {
        await CommoditiesStaticContent.create({ ...req.body });
        await CommodityController.clearCacheByNameAndCity(name, city);

        return success(res, 'Commodity added successfully!');
      }
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }

  static async commodityList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 2;

      const { rows: commodities, count: totalCommodities } = await CommoditiesStaticContent.findAndCountAll({
        limit: limit,
        offset: (page - 1) * limit,
        paranoid: false,
        order: [['name', 'ASC'], ['city', 'ASC']],
      });

      const totalPages = Math.ceil(totalCommodities / limit);

      return success(res, "commodities list", {
        data: commodities,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCommodities,
        },
      }, 200);
    } catch (error) {
      console.log(error);
      return failed(res, {}, error.message, 400);
    }
  }
  static formatDateToUTC(dateString) {
    // const [day, month, year] = dateString.split('-');
    // const date = new Date(Date.UTC(year, month - 1, day));
    // date.setUTCHours(0, 0, 0, 0);
    // return date.toISOString().split('T')[0] + ' 00:00:00';

    const startOfDay = new Date(dateString);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateString);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };

  }


  static async moduleDetail(req, res) {
    try {
      const { moduleType, name, city, date, tc_id, faq_id, day } = req.body;
      let module;

      switch (moduleType) {
        case 'commodity':
          module = await CommoditiesStaticContent.findOne({
            where: {
              name,
              city
            },
            paranoid: false,
          });
          break;

        case 'daily-update':
          if (!date) {
            return customFailedMessage(res, "Date is required for daily-update", 400);
          }

          const inputDate = moment(date, 'DD-MM-YYYY', true);

          const formattedDate = inputDate.tz('Asia/Kolkata').format('YYYY-MM-DD 00:00:00');

          module = await CommoditiesDailyUpdates.findOne({
            where: {
              name,
              city,
              date: Sequelize.literal(`date = '${formattedDate}'`)
            }
          });
          break;

        case 'top-content':
          module = await CommoditiesStaticContent.findOne({
            where: {
              name,
              city
            }
          });
          break;

        case 'faqs':
          module = await CommoditiesFAQ.findOne({
            where: {
              id: faq_id,
              name,
              city
            },
            paranoid: false,
          });
          break;

        case 'top-content-format':
          module = await CommoditiesTopContentFormat.findOne({
            where: {
              name,
              city
            },
            paranoid: false
          });
          break;

        case 'daily-update-format':
          module = await CommoditiesDailyUpdatesFormat.findOne({
            where: {
              name,
              city,
              day
            },
            paranoid: false
          });
          break;

        default:
          return customFailedMessage(res, "Module type not found", 400);
      }

      if (!module) {
        return customFailedMessage(res, "Module not found", 404);
      }

      return success(res, "Module details", module, 200);
    } catch (error) {
      return failed(res, {}, error.message, 500);
    }
  }

  static async dailyUpdatesList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 2;

      const { rows: dailyUpdates, count: totalDailyUpdates } = await CommoditiesDailyUpdates.findAndCountAll({
        where: {
          name: req.body.name,
          city: req.body.city
        },
        limit: limit,
        paranoid: false,
        offset: (page - 1) * limit,
        order: [['date', 'DESC']],
      });

      const totalPages = Math.ceil(totalDailyUpdates / limit);

      return success(res, "commodities list", {
        data: dailyUpdates,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalDailyUpdates,
        },
      }, 200);
    } catch (error) {
      console.log(error);
      return failed(res, {}, error.message, 400);
    }
  }
  static async addEditDailyUpdate(req, res) {
    try {
      const valid = new Validator(req.body, {
        name: 'required',
        city: 'required',
        date: 'required',
        editor_content: 'required',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, city, date } = req.body;
      console.log(req.body);

      const inputDate = moment(date, 'YYYY-MM-DD', true);
      console.log(inputDate)

      const formattedDate = inputDate.tz('Asia/Kolkata').format('YYYY-MM-DD 00:00:00');

      req.body.deletedAt = req.body.status === 'inactive' ? new Date() : null;
      req.body.editor_updatedAt = new Date();

      const existingCommodity = await CommoditiesDailyUpdates.findOne({
        where: { name, city, date: Sequelize.literal(`date = '${formattedDate}'`) },
      });

      console.log(existingCommodity);

      if (existingCommodity) {
        await CommoditiesDailyUpdates.update(
          { ...req.body },
          {
            where: { city, name, date: Sequelize.literal(`date = '${formattedDate}'`) },
          }
        );
        await CommodityController.clearCacheByNameAndCity(name, city);

        return success(res, 'Commodity Daily Updates updated successfully!');
      } else {
        await CommoditiesDailyUpdates.create({ ...req.body });
        await CommodityController.clearCacheByNameAndCity(name, city);

        return success(res, 'Commodity Daily Updates added successfully!');
      }
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
  static async topContentList(req, res) {
    try {
      const { name, city } = req.body;

      const topContent = await CommoditiesStaticContent.findOne({
        attributes: ['name', 'city', 'top_content', 'is_top_content_edited', 'editor_top_content', 'editor_top_content_updatedAt'],
        where: { name, city },
      });

      return success(res, "commodities list", { data: topContent }, 200);
    } catch (error) {
      console.log(error);
      return failed(res, {}, error.message, 400);
    }
  }
  static async addEditTopContent(req, res) {
    try {
      const valid = new Validator(req.body, {
        name: 'required',
        city: 'required',
        editor_content: 'required',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, city, editor_content } = req.body;

      const updateData = {
        is_top_content_edited: true,
        editor_top_content_updatedAt: new Date(),
        editor_top_content: editor_content,
      };

      const commodity = await CommoditiesStaticContent.findOne({
        where: {
          name: req.body.name,
          city: req.body.city
        }
      });
      console.log(commodity);
      if (commodity) {
        await commodity.update(updateData);
        await CommodityController.clearCacheByNameAndCity(name, city);
        return success(res, 'Commodity top content updated successfully!');
      } else {
        return notFoundMessage(res, 'Commodity not found');
      }
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }

  static async faqsList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 2;

      const { rows: faqs, count: totalFAQs } = await CommoditiesFAQ.findAndCountAll({
        where: {
          name: req.body.name,
          city: req.body.city
        },
        limit: limit,
        paranoid: false,
        offset: (page - 1) * limit,
        order: [['priority', 'ASC']],
      });

      const totalPages = Math.ceil(totalFAQs / limit);

      return success(res, "faqs list", {
        data: faqs,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalFAQs,
        },
      }, 200);
    } catch (error) {
      console.log(error);
      return failed(res, {}, error.message, 400);
    }
  }
  static async addFAQ(req, res) {
    try {
      // Validate the required fields
      const valid = new Validator(req.body, {
        name: 'required',
        city: 'required',
        faqs: 'required',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, city, faqs } = req.body;

      const faqData = faqs.map(faq => ({
        name,
        city,
        question: faq.question,
        answer: faq.answer,
        priority: faq.priority,
      }));

      const createdFAQs = await CommoditiesFAQ.bulkCreate(faqData);
      await CommodityController.clearCacheByNameAndCity(name, city);

      return success(res, 'FAQs added successfully!', createdFAQs);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }

  static async editFAQ(req, res) {
    try {
      const valid = new Validator(req.body, {
        id: 'required',
        name: 'required',
        city: 'required',
        question: 'required',
        answer: 'required',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      req.body.deletedAt = req.body.status === 'inactive' ? new Date() : null;
      const { name, city, id } = req.body;

      const [updatedCount] = await CommoditiesFAQ.update(req.body, {
        where: { name, city, id },
        paranoid: false,
      });

      if (updatedCount > 0) {
        await CommodityController.clearCacheByNameAndCity(name, city);

        return success(res, 'Commodity FAQ updated successfully!');
      } else {
        return failed(res, {}, 'No matching FAQ found to update.', 404);
      }
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }

  static async dailyUpdateFormatList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 2;

      const { name, city } = req.query;

      const queryConfig = {
        attributes: ['name', 'city'],
        order: [['city', 'ASC']],
        paranoid: false,
        limit,
        offset: (page - 1) * limit,
      };

      // Conditional query modifications
      if (name && city) {
        queryConfig.where = { name, city };
        queryConfig.attributes.push('day', 'createdAt', 'updatedAt', 'deletedAt');
        queryConfig.order = [['day', 'ASC']];
      } else {
        queryConfig.group = ['name', 'city'];
      }

      const { rows: commodities, count: totalCommodities } = await CommoditiesDailyUpdatesFormat.findAndCountAll(queryConfig);

      if (!commodities.length) {
        return success(res, "No commodities found", {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
          },
        }, 200);
      }


      const totalPages = Math.ceil(totalCommodities / limit);

      return success(res, "commodities list", {
        data: commodities,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCommodities,
        },
      }, 200);
    } catch (error) {
      console.log(error);
      return failed(res, {}, error.message, 400);
    }
  }

  static async topContentFormatList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 2;

      const { rows: commodities, count: totalCommodities } = await CommoditiesTopContentFormat.findAndCountAll({
        limit: limit,
        paranoid: false,
        offset: (page - 1) * limit,
        order: [['city', 'ASC']],
      });

      const totalPages = Math.ceil(totalCommodities / limit);

      return success(res, "commodities list", {
        data: commodities,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCommodities,
        },
      }, 200);
    } catch (error) {
      console.log(error);
      return failed(res, {}, error.message, 400);
    }
  }
  static async addEditTopContentFormat(req, res) {
    try {
      const valid = new Validator(req.body, {
        name: 'required|string',
        city: 'required|string',
        format: 'required|string',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, city } = req.body;

      const existingCommodity = await CommoditiesTopContentFormat.findOne({
        where: { name, city },
        paranoid: false,
      });

      req.body.deletedAt = req.body.status === 'inactive' ? new Date() : null;
      if (existingCommodity) {
        await CommoditiesTopContentFormat.update(
          { ...req.body },
          {
            where: { city, name },
            paranoid: false,
          }
        );

        return success(res, 'Top content format updated successfully!');
      } else {
        await CommoditiesTopContentFormat.create({ ...req.body });

        return success(res, 'Top content format added successfully!');
      }
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
  static async addEditDailyUpdateFormat(req, res) {
    try {
      console.log(req.body)
      const valid = new Validator(req.body, {
        name: 'required|string',
        city: 'required|string',
        day: 'required|string',
        format: 'required|string',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, city, day, format, status } = req.body;

      const existingCommodity = await CommoditiesDailyUpdatesFormat.findOne({
        attributes: ['name', 'city', 'day'],
        where: { name, city, day },
        paranoid: false,
      });

      const updateData = {
        format,
        deletedAt: status === 'inactive' ? new Date() : null,
      };

      if (existingCommodity) {
        await CommoditiesDailyUpdatesFormat.update(
          updateData,
          {
            where: { city, name, day },
            paranoid: false
          }
        );

        return success(res, 'Daily Update format updated successfully!');
      } else {
        console.log("entered create");
        await CommoditiesDailyUpdatesFormat.create({ name, city, day, format, deletedAt: updateData.deletedAt });

        return success(res, 'Daily format added successfully!');
      }
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }

  static async getCommodityCity(req, res) {
    try {
      const valid = new Validator(req.query, {
        name: 'required|string',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, type } = req.query;
      let citiesObjects;
      if (type == 'not-mapped') {
        citiesObjects = await CommoditiesMaster.findAll({
          attributes: ['city'],
          where: {
            city: {
              [Op.notIn]: Sequelize.literal(`(
                      SELECT city FROM commodities_static_content WHERE name = '${name}'
                  )`)
            }
          },
          group: ['city'],
          order: [['city', 'ASC']],
        });


      } else {
        citiesObjects = await CommoditiesStaticContent.findAll({
          attributes: ['city'],
          where: { name },
          group: ['city'],
        });
      }

      const cities = citiesObjects.map(item => item.city);

      console.log(cities);

      return success(res, "Cities", cities);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }

  static async getAuthToken() {
    try {
      const response = await fetch(`https://api-market.financialexpress.com/finance-api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "usernameOrEmail": "fe",
          "password": "itacs9"
        })
      });

      const json = await response.json();
      if (json) {
        return json.accessToken;
      }
      return null;
    } catch (error) {
      logger.error(`Error in getting access token ${error.message}`);
      console.error(error);
    }
  }

  static async clearCacheByNameAndCity(name, city) {
    if (!name) return false;

    let params = new URLSearchParams();
    params.append("purgeType", name.toLowerCase());

    if (name !== "all" && city) {
      if (city === "India") {
        city = "Mumbai";
      }
      params.append("cityName", city.toLowerCase());
    }

    const authToken = await CommodityController.getAuthToken();

    // Send request to clear cache by name and city
    console.log(params.toString())
    const response = await fetch(`https://api-market.financialexpress.com/commodity/purge?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
    });
    const responseData = await response.text();
    if (response.status === 200) {
      logger.error(responseData);
      return true;
    } else {
      logger.error(`Error clearing cache for commodity: ${name} ${city} - Response status: ${response.status} - Response data: ${responseData}`);
      return false;
    }
  }
  static async clearCache(req, res) {
    try {

      const valid = new Validator(req.body, {
        name: 'required|string',
      });

      const matched = await valid.check();
      if (!matched) return validationFailedRes(res, valid);

      const { name, city } = req.body;
      const response = await CommodityController.clearCacheByNameAndCity(name, city);
      if (!response) return failed(res, {}, "Failed to clear cache", 500);
      return success(res, "Cache cleared successfully");
    } catch (error) {
      logger.error(`Error clearing cache for commodity: ${name} ${city} ${error.message}`);
    }
  }
}
