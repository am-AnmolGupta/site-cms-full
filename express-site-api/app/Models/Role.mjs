import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const RoleSchema = mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
RoleSchema.plugin(mongoosePaginate);

const Role = mongoose.model('roles', RoleSchema);

export { Role };
