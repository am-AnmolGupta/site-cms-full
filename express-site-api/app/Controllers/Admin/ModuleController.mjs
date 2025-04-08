import { Channel } from "../../Models/Channel.mjs";
import { success, failed, customFailedMessage } from "../../Helper/response.mjs";
import { Profile } from "../../Models/Profile.mjs";
import { Role } from "../../Models/Role.mjs";
import { Admin } from "../../Models/Admin.mjs";
import { User } from "../../Models/User.mjs";
import { Lead } from "../../Models/Lead.mjs";
import { StaticPage } from "../../Models/StaticPage.mjs";
import { Navigation } from '../../Models/Navigation.mjs';
export class ModuleController extends Error {
  static async moduleDetail(req, res) {
    try {
      const { moduleType, moduleId, socialLinkId, channelId } = req.body;
      let module;

      switch (moduleType) {
        case 'channel':
          module = await Channel.findById(moduleId);
          break;
        case 'channelSocialLink':
          const channel = await Channel.findById(moduleId).select('socialLinks');

          module = channel.socialLinks.find(link => link._id.toString() === socialLinkId);

          break;
        case 'profile':
          module = await Profile.findById(moduleId);
          break;
        case 'profileSocialLink':
          const profile = await Profile.findById(moduleId).select('socialLinks');

          module = profile.socialLinks.find(link => link._id.toString() === socialLinkId);
          break;
        case 'role':
          module = await Role.findById(moduleId);
          break;
        case 'admin':
          module = await Admin.findById(moduleId);
          break;
        case 'user':
          module = await User.findById(moduleId);
          break;
        case 'lead':
          module = await Lead.findById(moduleId);
          break;
        case 'static-page':
          module = await StaticPage.findById(moduleId);
          break;
        case 'navigation':
          module = await Navigation.find({ level: moduleId, channelId: channelId });
          break;
        default:
          return customFailedMessage(res, "Module type not found", 400);
      }

      if (!module) {
        return customFailedMessage(res, "Module not found", 404);
      }

      const moduleData = module;

      return success(res, "Module details", moduleData, 200);
    } catch (error) {
      return failed(res, {}, error.message, 500);
    }
  }
}