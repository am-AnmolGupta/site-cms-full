import fs from 'fs';
import path from 'path';
import logger from './logger.mjs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { log } from 'console';
import { Specification } from '../Models/Specification.mjs';
import { Variant } from "../Models/Variant.mjs";
import { Model } from "../Models/Model.mjs";
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

export function parsePriceRange(priceRange) {
    const regexRange = /([\d.]+)\s*-\s*([\d.]+)\s*(Lakh|Crore)?/;
    const regexSingleValue = /([\d.]+)\s*(Lakh|Crore)?/;

    let minPrice, maxPrice;

    // Check for range (e.g., "64 - 67 Lakh")
    const matchRange = priceRange.match(regexRange);
    if (matchRange) {
        const value1 = parseFloat(matchRange[1]);
        const value2 = parseFloat(matchRange[2]);
        const unit = matchRange[3];

        if (unit === 'Lakh') {
            minPrice = value1 * 100000;
            maxPrice = value2 * 100000;
        } else if (unit === 'Crore') {
            minPrice = value1 * 10000000;
            maxPrice = value2 * 10000000;
        } else {
            minPrice = value1;
            maxPrice = value2;
        }
    } else {
        // Check for single value (e.g., "64 Lakh" or "1 Crore")
        const matchSingleValue = priceRange.match(regexSingleValue);
        if (matchSingleValue) {
            const value = parseFloat(matchSingleValue[1]);
            const unit = matchSingleValue[2];

            if (unit === 'Lakh') {
                minPrice = value * 100000;
                maxPrice = value * 100000;
            } else if (unit === 'Crore') {
                minPrice = value * 10000000;
                maxPrice = value * 10000000;
            } else {
                minPrice = value;
                maxPrice = value;
            }
        } else {
            throw new Error('Invalid price range format');
        }
    }

    // Validate and return
    if (minPrice === undefined || maxPrice === undefined || isNaN(minPrice) || isNaN(maxPrice)) {
        throw new Error('Invalid price range format');
    }

    return {
        minPrice: minPrice,
        maxPrice: maxPrice
    };
}

export function convertPriceToNumber(priceString) {
    const priceParts = priceString.split(' ');
    const amount = parseFloat(priceParts[0]);
    const unit = priceParts[1];

    if (unit === 'Lakh') {
        return amount * 100000;
    } else if (unit === 'Crore') {
        return amount * 10000000;
    } else {
        throw new Error('Unknown unit: ', unit);
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


export async function getDescriptionSpecifications(variantId) {
    try {
        const specSlugs = [
            'seating-capacity', 'fuel-type', 'mileage', 'displacement', 'cylinder', 'valves-configuration',
            'valves-per-cylinder', 'transmission', 'max-torque-nmrpm', 'max-power-bhprpm',
            'airbags', 'anti-lock-braking-system-abs', 'electronic-stability-program-esp', 'parking-sensors',
            'max-motor-performance', 'drivetrain', 'battery-capacity', 'driving-range'
        ];

        const specifications = await Specification.find({ moduleId: variantId, slug: { $in: specSlugs } });

        const slugValues = specifications.map(spec => {
            let value;

            if (spec.slug === 'seating-capacity') {
                const match = spec.values && Array.isArray(spec.values) && spec.values.length > 0
                    ? spec.values[0].value.match(/(\d+(\.\d+)?)/)
                    : null;

                value = match ? parseFloat(match[0]) : NaN;
            } else if (spec.slug === 'airbags') {
                value = Array.isArray(spec.values)
                    ? spec.values.map(val => val.value).join(' ')
                    : '';
            } else {
                value = Array.isArray(spec.values) && spec.values.length > 0
                    ? spec.values[0].value
                    : null;
            }

            return {
                slug: spec.slug,
                value
            };
        });

        return slugValues;
    } catch (error) {
        console.error('Error fetching specifications:', error);
        throw error;
    }
}

export async function generateDescription(variant_id) {
    try {
        const variant = await Variant.findById(variant_id);
        if (!variant) {
            return customFailedMessage(res, "Variant not found!", 404);
        }
        const model = await Model.findById(variant.modelId);
        if (!model) {
            return customFailedMessage(res, "Model not found!", 404);
        }
        const brand = await Brand.findById(model.brandId);
        if (!brand) {
            return customFailedMessage(res, "Brand not found!", 404);
        }
        const fullName = `${brand.name} ${model.name} ${variant.name}`;
        const nameWithModel = `${model.name} ${variant.name}`;
        const price = await getPriceInWords(variant.price);
        const specification = await getDescriptionSpecifications(variant._id);
        const specObj = specification.reduce((acc, spec) => {
            acc[spec.slug.replace(/-/g, '_')] = spec.value;
            return acc;
        }, {});

        const description = `
        <div>
          <h3>${fullName} Prices:</h3>
          <p>
            ${fullName} is the variant priced at 
            Rs ${price}, ex-showroom. 
            ${specObj.seating_capacity ? `This trim is a 
            ${specObj.seating_capacity || ''}-seater.` : ''} To know more about 
            ${fullName} details, images, and reviews, visit 
            expressdrives.com.
          </p>
        </div>

        ${(specObj.mileage && specObj.fuel_type != 'Electric') ? `<div>
          <h3>${fullName} ${specObj.fuel_type || ''} Fuel Efficiency:</h3>
          <p>
            According to ${brand.name} and based on ARAI tests, 
            ${nameWithModel} returns a fuel economy of 
            ${specObj.mileage || ''}.
          </p>
        </div>`: ''}
        
        ${specObj.fuel_type != 'Electric' ?
                `<div>
          <h3>${fullName} ${specObj.fuel_type || ''} Powertrain Specs:</h3>
          <p>
            ${fullName} gets a 
            ${specObj.displacement || ''} cc ${specObj.cylinder || ''}-cylinder 
              ${specObj.valves_per_cylinder ? `${specObj.valves_per_cylinder}-valve` : ''}
              ${specObj.valves_configuration || ''} 
            engine, paired with a 
            ${specObj.transmission || ''} transmission. The 
            ${specObj.displacement || ''} cc engine produces 
            ${specObj.max_power_bhprpm || ''} of power and 
            ${specObj.max_torque_nmrpm || ''} of torque.
          </p>
        </div>` : `
        <div>
        <h3>${fullName} ${specObj.fuel_type || ''} Powertrain Specs:</h3>
        <p>${fullName} Motor: ${specObj.max_motor_performance || ''} Drivetrain: ${specObj.drivetrain || ''} Battery: ${specObj.battery_capacity || ''}</p>
        <p>
            According to ${brand.name} and based on ARAI tests, 
            ${fullName}  ${specObj.fuel_type} returns a range of 
            ${specObj.driving_range || ''} on a single charge.
        </p>
        </div>
        `}

        <div>
        <h3>${nameWithModel} Safety Features:</h3>
        <p>
            Car safety features are a paramount concern for both drivers and passengers alike. 
            Prioritizing safety through advanced features and technologies is essential in making 
            roads safer for everyone.
            <ol>
                ${specObj.airbags ? `<li>Airbags: ${specObj.airbags}</li>` : ''}
                ${specObj.anti_lock_braking_system_abs ? `<li>Anti-lock Braking System (ABS): ${specObj.anti_lock_braking_system_abs}</li>` : ''}
                ${specObj.electronic_stability_program_esp ? `<li>Electronic Stability Control (ESC): ${specObj.electronic_stability_program_esp}</li>` : ''}
                ${specObj.parking_sensors ? `<li>Parking Sensors: ${specObj.parking_sensors}</li>` : ''}
            </ol>
        </p>
        </div>
        `;
        return description;
    } catch (error) {
        return {};
    }
}
