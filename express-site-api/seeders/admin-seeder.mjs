import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {Admin} from '../app/Models/Admin.mjs';

const seedAdmin = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/express-drive', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const existingAdmin = await Admin.findOne();
        console.log(existingAdmin);

        if (!existingAdmin) {
            const adminCredentials = {
                name: "superadmin",
                email: "admin@gmail.com",
                mobile: "9876543210",
                password: "admin",
                roles: ["superadmin"]
            };

            adminCredentials.password = await bcrypt.hash(adminCredentials.password, 12);

            await Admin.create(adminCredentials);

            console.log("Admin user created successfully");
        } else {
            console.log("Admin user already exists");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error seeding admin:", err);
    }
};

seedAdmin().then(() => {
    console.log("Admin seeding completed");
    process.exit(0);
}).catch((err) => {
    console.error("Error seeding admin:", err);
    process.exit(1);
});
