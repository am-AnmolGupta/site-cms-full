import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const UserSchema = new mongoose.Schema(
  {
    ssoId: {
      type: String,
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false
    },
    deletedAt: {
      type: Date,
      default: null
    },

  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(mongoosePaginate);

const User = mongoose.model("users", UserSchema);

export { User };
