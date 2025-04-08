import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import mongoose from "mongoose";
import { Navigation } from '../../Models/Navigation.mjs';
export class NavigationController {

  static async addNavigation(req, res) {
    try {
      const valid = new Validator(req.body, { level: 'required', navigation: 'required' });
      if (!(await valid.check())) return validationFailedRes(res, valid);

      const { level, navigation } = req.body;
      const parsedNavigation = JSON.parse(navigation);
      const idMapping = {}; // Maps temp IDs to MongoDB IDs
      const receivedIds = parsedNavigation.map(item => item.id).filter(id => !id.startsWith('temp-'));

      // Step 1: Delete only navigation items of the same level that are not in receivedIds
      await Navigation.deleteMany({
        _id: { $nin: receivedIds },
        level: Number(level) // Ensure only current level items are deleted
      });

      // Step 2: Update existing navigation items
      for (const item of parsedNavigation) {
        if (!item.id.startsWith('temp-')) {
          await Navigation.findByIdAndUpdate(item.id, {
            title: item.title,
            url: item.url,
            internal: item.internal,
            status: item.status
          });
          idMapping[item.id] = item.id;
        }
      }

      // Step 3: Insert new navigation items & store their real IDs
      for (const item of parsedNavigation) {
        if (item.id.startsWith('temp-')) {
          const newNav = await Navigation.create({
            channelId: item.channel_id,
            parentId: item.parent_id && idMapping[item.parent_id] ? idMapping[item.parent_id] : null,
            title: item.title,
            url: item.url,
            internal: item.internal,
            status: item.status,
            level: Number(level) // Ensure correct level assignment
          });
          idMapping[item.id] = newNav._id; // Store the new ID
        }
      }

      return success(res, {}, "Navigation updated successfully", 200);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }




  static async navigation(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const channelId = req.query.channelId || null;
      const matchStage = channelId ? { channelId: mongoose.Types.ObjectId(channelId) } : {};
      const navigations = await Navigation.aggregate([
        { $match: matchStage },
        { $group: { _id: "$level" } },
        { $sort: { _id: 1 } }
      ]);

      return success(res, "Navigation list", navigations, 200);
    } catch (error) {
      return failed(res, {}, error.message, 400);
    }
  }
}