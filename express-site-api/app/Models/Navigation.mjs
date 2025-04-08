import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const navigationSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'channels', // Assuming it references Channel
      required: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NavigationItem', // Self-reference
      default: null
    },
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    internal: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1 // e.g., 1 = nav, 2 = sub-nav, 3 = sub-sub-nav
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
navigationSchema.plugin(mongoosePaginate);

const Navigation = mongoose.model('navigation', navigationSchema);

export { Navigation };
