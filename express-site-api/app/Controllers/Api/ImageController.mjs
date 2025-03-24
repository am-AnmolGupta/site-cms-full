import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Validator } from 'node-input-validator';
import { validationFailedRes, failed } from "../../Helper/response.mjs";

export class ImageController {
    static async imageCrop(req, res) {
        const valid = new Validator(req.query, {
            w: 'in:160,320,480,640',
            h: 'in:160,320,480,640',
            fit: 'in:cover,contain,fill,inside,outside'
        });
        const matched = await valid.check()
        if (!matched)
            return validationFailedRes(res, valid);

        const s3 = new S3Client({
            region: process.env.AWS_DEFAULT_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        const { key } = req.params;
        const { w, h } = req.query;
        var fit = req.query.fit == undefined ? 'contain' : req.query.fit;

        if (w && h) {
            var filter = {
                width: parseInt(w),
                height: parseInt(h),
                fit: fit,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        } else if (w && h == undefined) {
            var filter = {
                width: parseInt(w),
                fit: fit,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        } else if (h && w == undefined) {
            var filter = {
                height: parseInt(h),
                fit: fit,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        } else if (h == undefined && w == undefined) {
            var filter = {}
        }

        try {
            const getObjectParams = {
                Bucket: process.env.AWS_BUCKET,
                Key: `${process.env.AWS_BASE_FOLDER}/${key}`
            };
            const command = new GetObjectCommand(getObjectParams);
            const s3Object = await s3.send(command);

            const chunks = [];
            for await (const chunk of s3Object.Body) {
                chunks.push(chunk);
            }
            const imageBuffer = Buffer.concat(chunks);
            if (Object.keys(filter).length > 0) {

                const resizedImage = await sharp(imageBuffer)
                    .resize(filter)
                    .webp().toBuffer();
                const fileSize = resizedImage.length;
                // console.log(`Cropped image size: ${fileSize / 1000} Kb`);
                res.setHeader('Content-Type', 'image/webp ');
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                res.send(resizedImage);
            } else {
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                res.send(imageBuffer);
            }

        } catch (error) {
            console.error('Error:', error);
            return failed(res, error.message, 400);
            // res.status(500).send('Error processing image');
        }
    }
}

