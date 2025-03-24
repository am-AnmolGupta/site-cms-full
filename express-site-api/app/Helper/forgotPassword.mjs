import nodemailer from 'nodemailer';

export function sendMail(url) {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "652d6de7ccc683",
            pass: "a82496a3dc31ab"
        }
    });
    const mailOptions = {
        from: 'youremail@mail.com',
        to: 'recieveremail@mail.com',
        subject: 'Your email title here',
        text: 'your email body content here',
        html: `
         <h1>Sample Heading Here</h1>
         <p>${url}</p>
        `,
        // attachments: [
        //     {
        //         filename: 'image.png',
        //         path: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
        //     }
        // ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}

