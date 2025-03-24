import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const FaqSchema = mongoose.Schema({
    moduleId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    moduleType: {
        type: String,
        required: true
    },
    faqs: [
        {
            question: {
                type: String,
                required: true
            },
            answer: {
                type: String,
                required: true
            },
            deletedAt: {
                type: Date,
                default: null
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

FaqSchema.plugin(mongoosePaginate);

const Faq = mongoose.model('faqs', FaqSchema);

export { Faq };
