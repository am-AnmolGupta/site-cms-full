import mongoose from 'mongoose';
// import { Model } from "./Model.mjs";
import mongoosePaginate from 'mongoose-paginate-v2';

const BrandSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: false
    },
    discontinued_model: {
        type: Boolean,
        default: 0
    },
    description: {
        type: String,
        required: false
    },
    news_keyword: {
        type: String,
        required: false
    },
    article_tag: {
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



BrandSchema.methods.getModelCount = async function () {
    return await Model.find({ brandId: this._id }).count();
};

BrandSchema.virtual('logoImage').get(function () {
    return this.logo ? process.env.IMAGE_URL + this.logo : "";
});

BrandSchema.virtual('seoImage').get(function () {
    return this.seo_image ? process.env.IMAGE_URL + this.seo_image : "";
});

BrandSchema.set('toJSON', {
    virtuals: true
});
BrandSchema.plugin(mongoosePaginate);
const Brand = mongoose.model('brands', BrandSchema);


export { Brand };
