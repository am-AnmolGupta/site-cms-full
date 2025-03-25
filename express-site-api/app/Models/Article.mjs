import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ArticleSchema = mongoose.Schema({
    channelId: {
        type: mongoose.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    category_id: {
        type: mongoose.Types.ObjectId,
        ref: 'Channel',
        required: true
    },
    tags: [
        {
            value: {
                type: String,
                required: true
            }
        }
    ],
    authors: [
        {
            value: {
                type: String,
                required: true
            }
        }
    ],
    relatedElements: [
        {
            value: {
                type: String,
                required: true
            }
        }
    ],
    type: {
        type: String,
        required: true
    },
    layout: {
        type: Boolean,
        default: 1
    },
    exclusive: {
        type: Boolean,
        default: 1
    },
    publish: {
        type: Boolean,
        default: 1
    },
    publishTime: {
        type: Boolean,
        default: 1
    },
    canonical: {
        type: String,
        required: false
    },
    seo_title: {
        type: String,
        required: false
    },
    seo_description: {
        type: String,
        required: false
    },
    seo_keywords: {
        type: String,
        required: false
    },
    seo_image: {
        type: String,
        required: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    model_count: 0
}, {
    timestamps: true
});

ArticleSchema.plugin(mongoosePaginate);
const Article = mongoose.model('articles', ArticleSchema);


export { Article };
