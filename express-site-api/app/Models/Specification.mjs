import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const SpecificationSchema = mongoose.Schema({
    moduleId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    moduleType: {
        type: String,
        required: true
    },
    attributeId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    attribute_name: {
        type: String,
        required: true
    },
    values: [
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
    sub_type: {
        type: String,
        required: true
    },
    sub_type_label: {
        type: String,
        required: false
    },
    slug: {
        type: String,
        required: false
    },
    unit: {
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
SpecificationSchema.plugin(mongoosePaginate);

const Specification = mongoose.model('specifications', SpecificationSchema);

export { Specification };
