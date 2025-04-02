import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const StaticPageSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    headerHtml: { type: String, required: false },
    footerHtml: { type: String, required: false },
    seoTitle: { type: String, required: false },
    seoDescription: { type: String, required: false },
    seoImage: { type: String, required: false },
    seoKeywords: { type: String, required: false },
  },
  { timestamps: true }
);

StaticPageSchema.plugin(mongoosePaginate);
const StaticPage = mongoose.model('static_pages', StaticPageSchema);

export { StaticPage };