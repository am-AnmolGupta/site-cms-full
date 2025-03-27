import { Channel } from "../../Models/Channel.mjs";
import { success, failed, customFailedMessage } from "../../Helper/response.mjs";
import { Profile } from "../../Models/Profile.mjs";

export class ModuleController extends Error {
  static async moduleDetail(req, res) {
    try {
      const { moduleType, moduleId } = req.body;
      let module;

      switch (moduleType) {
        case 'channel':
          module = await Channel.findById(moduleId);
          break;
        case 'socialLink':
          const socialLinks = await Channel.findById(moduleId).select('socialLinks');
          const { socialLinkId } = req.body;

          const matchingSocialLink = socialLinks.socialLinks.find(link => link._id.toString() === socialLinkId);
          module = matchingSocialLink;
          break;
        case 'profile':
          module = await Profile.findById(moduleId);
          break;
        default:
          return customFailedMessage(res, "Module type not found", 400);
      }

      if (!module) {
        return customFailedMessage(res, "Module not found", 404);
      }

      const moduleData = module.toObject({ virtuals: true });

      return success(res, "Module details", moduleData, 200);
    } catch (error) {
      return failed(res, {}, error.message, 500);
    }
  }
}