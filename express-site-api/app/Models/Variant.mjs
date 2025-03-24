import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const VariantSchema = mongoose.Schema({
    modelId: {
        type: mongoose.Types.ObjectId,
        ref: 'Model',
        required: true
    },
    name: {
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
    price: {
        type: Number,
        required: true
    },
    fuel_type: {
        type: String,
        required: false,
        default: "",
    },
    transmission: {
        type: String,
        required: false,
        default: "",
    },
    news_keyword: {
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
    mapping_name: {
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

VariantSchema.virtual('seoImage').get(function () {
    return this.seo_image ? process.env.IMAGE_URL + this.seo_image : "";
});
VariantSchema.set('toJSON', {
    virtuals: true
});

VariantSchema.plugin(mongoosePaginate);

const Variant = mongoose.model('variants', VariantSchema);

export { Variant };
