// In Admin.mjs
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import bcrypt from 'bcrypt';

const AdminSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    roles: [
        {
            type: String,
            required: true,
        }
    ],
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

AdminSchema.methods.hash = function (password) {
    return bcrypt.hashSync(password, 12);
};
AdminSchema.plugin(mongoosePaginate);
const Admin = mongoose.model('admins', AdminSchema);

export { Admin };
