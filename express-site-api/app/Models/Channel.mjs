import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

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
    type: String,
    required: false
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
  }
}, {
  timestamps: true
});

ChannelSchema.virtual('seoImage').get(function () {
  return this.seoImage ? process.env.IMAGE_URL + this.seoImage : "";
});

ChannelSchema.set('toJSON', {
  virtuals: true
});
ChannelSchema.plugin(mongoosePaginate);
const Channel = mongoose.model('channels', ChannelSchema);


export { Channel };
