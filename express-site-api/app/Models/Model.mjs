import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const ModelSchema = mongoose.Schema({
    brandId: {
        type: mongoose.Types.ObjectId,
        ref: 'Brand',
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
    logo: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    min_price: {
        type: Number,
        required: false,
        default: 0
    },
    max_price: {
        type: Number,
        required: false,
        default: 0
    },
    engine_unit: {
        type: String,
        required: false,
        default: null
    },
    mileage_unit: {
        type: String,
        required: false,
        default: null
    },
    min_mileage: {
        type: Number,
        required: false,
        default: 0
    },
    max_mileage: {
        type: Number,
        required: false,
        default: 0
    },
    min_engine: {
        type: Number,
        required: false,
        default: 0
    },
    max_engine: {
        type: Number,
        required: false,
        default: 0
    },
    min_seater: {
        type: Number,
        required: false,
        default: 0
    },
    max_seater: {
        type: Number,
        required: false,
        default: 0
    },
    min_airbags: {
        type: Number,
        required: false,
        default: 0
    },
    max_airbags: {
        type: Number,
        required: false,
        default: 0
    },
    fuel_type: {
        type: [String],
        required: false,
        default: [],
    },
    is_ev: {
        type: Boolean,
        required: false,
        default: false,
    },
    min_battery: {
        type: Number,
        required: false,
        default: 0
    },
    max_battery: {
        type: Number,
        required: false,
        default: 0
    },
    battery_unit: {
        type: String,
        required: false,
        default: null
    },
    min_range: {
        type: Number,
        required: false,
        default: 0
    },
    max_range: {
        type: Number,
        required: false,
        default: 0
    },
    range_unit: {
        type: String,
        required: false,
        default: null
    },
    transmission: {
        type: [String],
        required: false,
        default: [],
    },
    popular_model: {
        type: Boolean,
        default: 0
    },
    body_type: {
        type: String,
        required: false
    },
    discontinued_model: {
        type: Boolean,
        default: 0
    },
    release_date: {
        type: Date,
        default: null
    },
    rating: {
        type: String,
        default: null
    },
    pros: {
        type: String,
        required: false
    },
    cons: {
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
    has_variant: {
        type: Boolean,
        default: false
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
    }
}, {
    timestamps: true
});
ModelSchema.virtual('logoImage').get(function () {
    return this.logo ? process.env.IMAGE_URL + this.logo : "";
});

ModelSchema.virtual('seoImage').get(function () {
    return this.seo_image ? process.env.IMAGE_URL + this.seo_image : "";
});

ModelSchema.set('toJSON', {
    virtuals: true
});
ModelSchema.plugin(mongoosePaginate);

const Model = mongoose.model('models', ModelSchema);

export { Model };
