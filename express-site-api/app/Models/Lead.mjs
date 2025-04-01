import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const LeadSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'channels', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String },
  company: { type: String },
  designation: { type: String },
  industry: { type: String },
  website: { type: String },
  city: { type: String },
  country: { type: String },
  campaignName: { type: String },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

LeadSchema.plugin(mongoosePaginate);

const Lead = mongoose.model('leads', LeadSchema);

export { Lead };
