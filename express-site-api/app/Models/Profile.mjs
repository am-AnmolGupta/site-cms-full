import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const socialLinkSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    platform: { type: String, required: true },
    description: { type: String, required: false },
    url: { type: String, required: true },
    logo: { type: String, required: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const ProfileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      required: false
    },
    company: {
      type: String,
      required: false
    },
    type: {
      type: String,
      enum: ['individual', 'company'],
      required: true
    },
    image: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    industry: {
      type: String,
      required: false
    },
    slug: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: false
    },
    location: {
      type: String,
      required: false
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: []
    },
    website: {
      type: String,
      required: false
    },
    priority: {
      type: Number,
      default: 0,
    },
    promoted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

ProfileSchema.plugin(mongoosePaginate);

const Profile = mongoose.model('profiles', ProfileSchema);

export { Profile };