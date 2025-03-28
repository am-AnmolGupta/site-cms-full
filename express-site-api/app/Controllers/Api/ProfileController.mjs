import { Validator } from 'node-input-validator';
import { success, failed, failedValidation, validationFailedRes } from "../../Helper/response.mjs";
import mongoose from "mongoose";
import { Profile } from "../../Models/Profile.mjs";
export class ProfileController {
  static async getProfiles(req, res) {
    try {
      const profiles = await Profile.aggregate([
        {
          $group: {
            _id: "$type",
            profiles: {
              $push: {
                _id: "$_id",
                type: "$type",
                title: "$title",
                image: "$image",
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            data: {
              $push: {
                k: "$_id",
                v: "$profiles"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            company: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$data",
                    as: "d",
                    cond: { $eq: ["$$d.k", "company"] }
                  }
                }, 0
              ]
            },
            individual: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$data",
                    as: "d",
                    cond: { $eq: ["$$d.k", "individual"] }
                  }
                }, 0
              ]
            }
          }
        },
        {
          $project: {
            company: { $ifNull: ["$company.v", []] },
            individual: { $ifNull: ["$individual.v", []] }
          }
        }
      ]);

      success(res, "Profile Data", profiles[0] || { company: [], individual: [] });
    } catch (error) {
      failed(res, error.message);
    }
  }
}