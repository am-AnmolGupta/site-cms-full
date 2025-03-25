import fs from 'fs';
import path from 'path';
import logger from './logger.mjs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { log } from 'console';

import { Brand } from "../Models/Brand.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function fileUpload(file, customFileName = null) {
    try {
        const uploadDir = process.env.FILE_UPLOAD_PATH;
        if (process.env.APP_ENVIRONMENT == "live") {

            const s3Client = new S3Client({
                region: process.env.AWS_DEFAULT_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                }
            });
            const fileExtension = path.parse(file.name).ext;
            const newFileName = customFileName ? `${customFileName}-${Date.now()}${fileExtension}` : `${Date.now()}${fileExtension}`;

            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: `${process.env.AWS_BASE_FOLDER}/${newFileName}`,
                Body: file.data,
                ContentType: file.mimetype,
                ACL: 'public-read'
            };
            s3Client.send(new PutObjectCommand(params))
                .then(data => {
                    console.log('File uploaded successfully. Data:', data);
                })
                .catch(err => {
                    console.error('Error uploading file:', err);
                });
            return newFileName;
        }
        else {
            if (!process.env.FILE_UPLOAD_PATH) {
                logger.error('FILE_UPLOAD_PATH environment variable is not defined');
            }

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileExtension = path.parse(file.name).ext;
            const newFileName = customFileName ? `${customFileName}-${Date.now()}${fileExtension}` : `${Date.now()}${fileExtension}`;

            file.mv(`${uploadDir}/${newFileName}`, (err) => {
                if (err) {
                    logger.error('File upload error:', err);
                }
            });

            return newFileName;
        }
    } catch (err) {
        logger.error('File upload error:', err);
    }

}



export function deslufy(input) {
    return input
        .replace(/-/g, ' ')
        .replace(/[^a-zA-Z0-9 &]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export async function downloadAndUploadToS3(fileUrl, customFileName) {
    try {
        logger.info('Downloading file ' + fileUrl + ' to ' + customFileName);
        const s3Client = new S3Client({
            region: process.env.AWS_DEFAULT_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        logger.info(`AWS S3 client created: ${S3Client}`);
        var response;
        console.log(fileUrl);
        // Step 1: Download the file from the URL
        try {
            response = await axios({
                method: 'GET',
                url: fileUrl,
                responseType: 'stream'
            });

            console.log('Response: ' + response);
            logger.info(`${fileUrl},  ${response}`);

        } catch (error) {
            logger.info(`${error}`);
        }

        const fileExtension = path.extname(fileUrl);
        const newFileName = customFileName ? `${customFileName}-${Date.now()}${fileExtension}` : `${uuidv4()}${fileExtension}`;
        logger.info(`New file: ${newFileName}`);
        const tempFilePath = path.join(__dirname, newFileName);
        logger.info(`File Path ${tempFilePath}`);

        // Save the file temporarily
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);
        logger.info(`File saved to ${tempFilePath}`);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Step 2: Upload the file to S3
        const fileContent = fs.readFileSync(tempFilePath);
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: `${process.env.AWS_BASE_FOLDER}/${newFileName}`,
            Body: fileContent,
            ContentType: response.headers['content-type'],
            ACL: 'public-read'
        };
        logger.info(`Uploading to S3: ${params.Key}`);

        await s3Client.send(new PutObjectCommand(params));

        // Step 3: Clean up the file from the server
        fs.unlinkSync(tempFilePath);
        return newFileName;
    } catch (err) {
        logger.error(err);
        console.error('Error in downloadAndUploadToS3:', err);
        throw err;
    }
}
export async function deleteCacheFiles(req, res) {
    try {
        const folderPath = process.cwd() + '/cache';

        fs.readdir(folderPath, (err, files) => {
            if (err) {
                // console.error('Error reading directory:', err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(folderPath, file);

                fs.unlink(filePath, err => {
                    if (err) {
                        // console.error('Error deleting file:', err);
                    } else {
                        // console.log('Deleted file:', filePath);

                    }
                });
            });
        });

    } catch (error) {

    }
}
export async function getPriceInWords(price) {
    try {
        if (price >= 10000000) {
            return `${(price / 10000000).toFixed(2)} Crore`;
        } else if (price >= 100000) {
            return `${(price / 100000).toFixed(2)} Lakh`;
        } else {
            return price.toString();
        }
    } catch (error) {
        console.error('Error converting price:', error);
    }
}



