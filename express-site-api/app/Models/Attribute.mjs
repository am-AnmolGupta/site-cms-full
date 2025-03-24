import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const AttributeSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: false
    },
    acceptable_values: [
        {
            value: {
                type: String,
                required: true
            }
        }
    ],
    unit: {
        type: String,
        required: false
    },
    relates_to: [
        {
            value: {
                type: String,
                required: true
            }
        }
    ],
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

AttributeSchema.plugin(mongoosePaginate);

const Attribute = mongoose.model('attributes', AttributeSchema);

export { Attribute };
