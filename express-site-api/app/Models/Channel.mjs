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
const ChannelSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  seoTitle: {
    type: String,
    required: false
  },
  seoDescription: {
    type: String,
    required: false
  },
  seoImage: {
    type: String,
    required: false
  },
  seoKeywords: {
    type: String,
    required: false
  },
  cmsChannelId: {
    type: Number,
    required: false
  },
  socialLinks: {
    type: [socialLinkSchema],
    default: [],
  },
  logoUnit: {
    type: String,
    required: false
  },
  ga: {
    type: String,
    required: false
  },
  comScore: {
    type: String,
    required: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

ChannelSchema.plugin(mongoosePaginate);
const Channel = mongoose.model('channels', ChannelSchema);


export { Channel };
