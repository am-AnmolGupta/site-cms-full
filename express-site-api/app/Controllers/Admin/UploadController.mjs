import { Attribute } from "../../Models/Attribute.mjs";
import { Brand } from "../../Models/Brand.mjs";
import { Model } from "../../Models/Model.mjs";
import { Media } from "../../Models/Media.mjs";
import { Variant } from "../../Models/Variant.mjs";
import { Specification } from "../../Models/Specification.mjs";
import { success, failed } from "../../Helper/response.mjs";
import { parsePriceRange, convertPriceToNumber, deslufy } from "../../Helper/util.mjs"
import { SpecificationController } from "../Admin/SpecificationController.mjs"
import logger from "../../Helper/logger.mjs";
import { downloadAndUploadToS3, generateDescription } from "../../Helper/util.mjs";

export class UploadController extends Error {
    static async slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }


    static async uploadAttribute(req, res) {
        try {
            for (const element of req.body) {
                var name = element.key.replace(/\(.*?\)/g, '').trim();
                var slug = await UploadController.slugify(name);
                var isExisting = await Attribute.find({ slug: slug.toLowerCase() });
                if (isExisting.length === 0) {
                    element.name = name;
                    element.slug = slug.toLowerCase();
                    element.type = element.type ?? "specification|engine-transmission";
                    element.acceptable_values = element.values.map(item => ({ value: item }));
                    element.relates_to = [
                        {
                            "value": "car"
                        }
                    ];
                    element.unit = element.unit;
                    await Attribute.create(element);
                }
            }
            return success(res, "upload successfully", 200);

        } catch (error) {
            return failed(res, error.message, 400);
        }
    }

    static async uploadBrand(req, res) {
        try {
            for (const element of req.body) {
                var name = element.name.replace(/\(.*?\)/g, '').trim();
                var slug = await UploadController.slugify(element.name);
                // var isExisting = await Brand.findone({ slug: slug.toLowerCase() });
                // if (!isExisting) {
                element.name = name;
                element.slug = slug.toLowerCase();
                element.description = element.description;
                element.logo = null;
                element.news_keyword = null;
                const currentYear = new Date().getFullYear();
                element.seo_title = `${name} Cars ${currentYear}: ${name} New Cars, ${currentYear} ${name} Car Price in India, Images, Reviews`;
                element.seo_description = `${name} Car Price ${currentYear}: Check ${name} new cars ${currentYear} price in India, new ${name} car launch date, ${name} car reviews on financialexpress.com. Planning to buy a ${name} car? check ${name} cars features, specifications, engine, mileage, interior and exterior images, reviews and more.`;
                element.seo_keywords = `${name} cars, new ${name} cars, ${name} cars ${currentYear}, ${name} car price in india, ${name} electric car, ${name} cng car, ${name} suv car, ${name} hatchback car, ${name} cars reviews, ${name} cars new launches, ${name} sedan cars, ${name} car features, ${name} cars specifications`;
                element.seo_image = null;

                // to be uncomment in case of production environment
                // element.deletedAt = new Date();

                await Brand.create(element);
                // }
            }
            return success(res, "Brands uploaded successfully", 200);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async uploadModel(req, res) {
        try {
            for (const element of req.body) {
                var name = element.model_name.replace(/\(.*?\)/g, '').trim();
                console.log(name);
                var bname = element.brand_name.replace(/\(.*?\)/g, '');
                var brand_slug = await UploadController.slugify(bname);

                var brand = await Brand.findOne({ slug: brand_slug.toLowerCase() });
                var nameWithoutBrand = name.replace(new RegExp(bname, 'gi'), '').trim();
                var slug = await UploadController.slugify(nameWithoutBrand);

                var brand_id = brand._id;
                var { minPrice, maxPrice } = parsePriceRange(element.price_range);
                var isExisting = await Model.findOne({ slug: slug.toLowerCase() });
                if (!isExisting) {
                    element.name = nameWithoutBrand;
                    element.slug = slug.toLowerCase();
                    element.description = element.description;
                    element.brandId = brand_id;
                    element.logo = null;
                    element.news_keyword = null;
                    element.pros = null;
                    element.cons = null;
                    const currentYear = new Date().getFullYear();
                    element.seo_title = `${bname} ${nameWithoutBrand} Price ${currentYear}: ${bname} ${nameWithoutBrand} Images, Mileage, Colors, Reviews, Safety Ratings, Discount Offers ${currentYear}`;
                    element.seo_description = `${bname} ${nameWithoutBrand} Price in India ${currentYear}: Check out the latest ${bname} ${nameWithoutBrand} Price on road price in India, interior and exterior images, color variants, mileage, safety ratings, features, specifications, engine, reviews, discount offers and more on financial express auto.`;
                    element.seo_keywords = `${bname} ${nameWithoutBrand}, ${bname} ${nameWithoutBrand} Price, ${bname} ${nameWithoutBrand} Reviews, ${bname} ${nameWithoutBrand} Features, ${bname} ${nameWithoutBrand} Price in India, ${bname} ${nameWithoutBrand} Specification, ${bname} ${nameWithoutBrand} Variants, ${bname} ${nameWithoutBrand} Colors, ${bname} ${nameWithoutBrand} Images, ${bname} ${nameWithoutBrand} Videos, ${bname} ${nameWithoutBrand} Offers, ${bname} ${nameWithoutBrand} Discounts`;
                    element.seo_image = null;
                    element.min_price = minPrice;
                    element.max_price = maxPrice;
                    element.release_date = element.model_launch_date;

                    // to be uncomment in case of production environment
                    // element.deletedAt = new Date();

                    await Model.create(element);
                }
            }
            return success(res, "Models uploaded successfully", 200);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }

    static async uploadVariant(req, res) {
        try {
            for (const element of req.body) {
                var name = element.variant_name.trim();
                var mname = element.model_name.trim();
                var bname = element.brand_name.trim();
                var price = convertPriceToNumber(element.price);

                var modelWithoutBrand = mname.replace(new RegExp(bname, 'gi'), '').trim();
                var nameWithoutModel = name.replace(new RegExp(modelWithoutBrand, 'gi'), '').trim();

                var slug = await UploadController.slugify(nameWithoutModel);
                var model_slug = await UploadController.slugify(modelWithoutBrand);
                var mapping_name = await UploadController.slugify(name);

                var model = await Model.findOne({ slug: model_slug.toLowerCase() });
                if (!model) {
                    logger.error(`Model: ${mname}`);
                } else {
                    var model_id = model._id;
                    var isExisting = await Variant.findOne({ modelId: model._id, slug: slug.toLowerCase() });
                    if (!isExisting) {
                        logger.error(`Variant: ${name}`);
                        console.log(`Variant: ${name}`);
                        element.name = nameWithoutModel;
                        element.slug = slug.toLowerCase();
                        element.description = element.variant_description;
                        element.modelId = model_id;
                        element.news_keyword = null;
                        element.seo_title = `${name} On Road Price: ${name} Images, Colors, Features, Specifications, Reviews`
                        element.seo_description = `${name} on Road Price in India: Check out ${name} price, interior/exterior images, color variants, features, specifications, reviews, mileage and more on financialexpress.com.`
                        element.seo_keywords = `${name} manual price, ${name} on road price in india, ${name} images, ${name} colors, ${name} features, ${name} specifications, ${name} reviews, ${name} mileage, ${name} interior images, ${name} exterior images`;
                        element.price = price;
                        element.mapping_name = mapping_name.toLowerCase();
                        element.deletedAt = new Date();
                        await Variant.create(element);
                    }
                }
            }
            return success(res, "Varinats uploaded successfully", 200);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async uploadSpecification(req, res) {
        try {
            const numericRangeAttributes = new Set(['displacement', 'mileage', 'seating-capacity', 'airbags', 'driving-range', 'max-motor-performance']);
            const distinctRangeAttributes = new Set(['transmission', 'fuel-type']);

            for (const element of req.body) {
                const { key, variant_name, value } = element;
                const name = key.trim();
                const slug = await UploadController.slugify(name);
                const vname = variant_name.trim();
                const variant_slug = await UploadController.slugify(vname);

                const variant = await Variant.findOne({ mapping_name: variant_slug.toLowerCase() });
                if (!variant) {
                    logger.error(`Not Found => Variant: ${variant_name}, Specification: ${key}`);
                    continue;
                }
                const values = (typeof value === "number" || typeof value === 'string')
                    ? value.toString().trim()
                    : "No";

                // console.log(variant_slug, slug, values);
                // logger.error(`Variant: ${variant_name}, Specification: ${key}, Values: ${values}`);

                const variant_id = variant._id;
                const lowerSlug = slug.toLowerCase();
                // const isExisting = await Specification.findOne({ moduleId: variant_id, slug: lowerSlug });
                // if (!isExisting) {
                console.log(variant_slug, slug, values);
                logger.error(`Variant: ${variant_name}, Specification: ${key}, Values: ${values}`);
                if (lowerSlug === 'engine' && !values.includes("Not Applicable")) {
                    await UploadController.processEngineSpecifications(variant_id, values);
                } else if (lowerSlug === 'transmission' && !values.includes("CVT")) {
                    await UploadController.processTransmissionSpecifications(variant_id, values);
                } else if (lowerSlug === 'battery') {
                    await UploadController.processBatterySpecifications(variant_id, values);
                } else {
                    await UploadController.processGeneralSpecifications(
                        variant_id,
                        lowerSlug,
                        name,
                        values,
                        numericRangeAttributes,
                        distinctRangeAttributes
                    );
                }

                if (lowerSlug === 'fuel-type') {
                    await UploadController.updateVariantKey(variant_id, lowerSlug, values);
                }
                // }
            }

            console.log("Specification Upload completed successfully");
            return success(res, "Specifications uploaded successfully", 200);
        } catch (error) {
            console.log("Specification Upload failed: " + error.message);
            return failed(res, error.message, 400);
        }
    }

    static async updateVariantKey(variantId, slug, values) {
        if (slug === 'transmission') {
            const variant = await Variant.findOneAndUpdate(
                { _id: variantId },
                { $set: { transmission: values } }
            );
        }
        if (slug === 'fuel-type') {
            const variant = await Variant.findOneAndUpdate(
                { _id: variantId },
                { $set: { fuel_type: values } }
            );
        }
    }
    static async processEngineSpecifications(variantId, values) {
        const engine_parts = values.split(',');
        if (engine_parts.length === 4) {
            const [displacement, cylinders, value_per_cylinder, value_configuration] = engine_parts.map(part => part.match(/\d+/)?.[0] || part.trim());
            await UploadController.createEngineSpecifications(variantId, displacement, cylinders, value_per_cylinder, value_configuration);
        }
    }

    static async processTransmissionSpecifications(variantId, values) {
        const [transmission_type, gears] = values.split(',')[0].split('-');
        if (gears && !gears.includes("Not Applicable")) {
            const transmission = transmission_type.trim();
            const gearCount = gears.match(/\d+/)[0];
            await UploadController.createTransmissionSpecifications(variantId, transmission, gearCount);
            await UploadController.updateVariantKey(variantId, 'transmission', transmission);
        }
    }

    static async processBatterySpecifications(variantId, values) {
        const battery_parts = values.split(',');
        if (battery_parts.length >= 3) {
            const capacity = battery_parts.find(part => part.includes('kWh'))?.trim();
            const type = battery_parts.find(part => /(Nickel Metal Hydride|Lithium Ion|Lithium Iron Phosphate)/.test(part))?.trim();
            const current = battery_parts.find(part => part.includes('Volt'))?.trim();
            const placement = battery_parts.find(part => part.includes('Battery Placed'))?.trim();
            await UploadController.createBatterySpecifications(variantId, capacity, type, current, placement);
        }
    }

    static async processGeneralSpecifications(variantId, slug, name, values, numericRangeAttributes, distinctRangeAttributes) {
        const attribute = await Attribute.findOne({ slug });
        if (!attribute || !attribute._id) {
            // throw new Error(`Attrsibute not found for variant slug: ${slug}`);
        }
        else {

            const [type, sub_type] = attribute.type.split("|");
            const sub_type_label = await deslufy(sub_type);
            const valuesArray = values.split(',')
                .map(val => val.trim())
                .filter(Boolean)
                .map(value => ({ value }));

            await Specification.create({
                moduleId: variantId,
                moduleType: "variant",
                attributeId: attribute._id,
                attribute_name: name,
                values: valuesArray,
                type,
                sub_type,
                sub_type_label,
                slug,
                unit: attribute.unit
            });

            if (numericRangeAttributes.has(slug)) {
                await SpecificationController.updateRanges(variantId, attribute._id, 'num', slug, attribute.unit);
            } else if (distinctRangeAttributes.has(slug)) {
                await SpecificationController.updateRanges(variantId, attribute._id, 'distinct', slug);
            }
        }
    }

    static async createEngineSpecifications(variant_id, displacement, cylinders, value_per_cylinder, value_configuration) {
        const displacementAttr = await Attribute.findOne({ slug: 'displacement' });
        await Specification.create({
            moduleId: variant_id,
            moduleType: "variant",
            attributeId: displacementAttr._id,
            attribute_name: displacementAttr.name,
            values: [{ value: displacement }],
            type: "specification",
            sub_type: "engine-transmission",
            sub_type_label: "Engine & Transmission",
            slug: "displacement",
            unit: "cc"
        });
        await SpecificationController.updateRanges(variant_id, displacementAttr._id, 'num', displacementAttr.slug.toLowerCase(), 'cc');

        const cylinderAttr = await Attribute.findOne({ slug: 'cylinder' });
        await Specification.create({
            moduleId: variant_id,
            moduleType: "variant",
            attribute_name: "Cylinder",
            attributeId: cylinderAttr._id,
            values: [{ value: cylinders }],
            sub_type: "engine-transmission",
            sub_type_label: "Engine & Transmission",
            type: "specification",
            slug: "cylinder",
            unit: ""
        });

        const valuePerCylinderAttr = await Attribute.findOne({ slug: 'valves-per-cylinder' });
        await Specification.create({
            moduleId: variant_id,
            moduleType: "variant",
            attribute_name: "Valves per Cylinder",
            values: [{ value: value_per_cylinder }],
            attributeId: valuePerCylinderAttr._id,
            type: "specification",
            sub_type: "engine-transmission",
            sub_type_label: "Engine & Transmission",
            slug: "valves-per-cylinder",
            unit: ""
        });


        const valueConfigurationAttr = await Attribute.findOne({ slug: 'valves-configuration' });
        await Specification.create({
            moduleId: variant_id,
            moduleType: "variant",
            attribute_name: "Valves Configuration",
            values: [{ value: value_configuration }],
            attributeId: valueConfigurationAttr._id,
            type: "specification",
            sub_type: "engine-transmission",
            sub_type_label: "Engine & Transmission",
            slug: "valves-configuration",
            unit: ""
        });

    }

    static async createTransmissionSpecifications(variant_id, transmission, gears) {
        const transmissionAttr = await Attribute.findOne({ slug: 'transmission' });

        await Specification.create({
            moduleId: variant_id,
            moduleType: "variant",
            attribute_name: "Transmission",
            attributeId: transmissionAttr._id,
            values: [{ value: transmission }],
            type: "specification",
            sub_type: "engine-transmission",
            sub_type_label: "Engine & Transmission",
            slug: "transmission",
            unit: ""
        });
        await SpecificationController.updateRanges(variant_id, transmissionAttr._id, 'distinct', transmissionAttr.slug.toLowerCase(), transmissionAttr.unit);


        const gearAttr = await Attribute.findOne({ slug: 'gears' });

        await Specification.create({
            moduleId: variant_id,
            moduleType: "variant",
            attribute_name: "Gears",
            values: [{ value: gears }],
            attributeId: gearAttr._id,
            type: "specification",
            sub_type: "engine-transmission",
            sub_type_label: "Engine & Transmission",
            slug: "gears",
            unit: ""
        });
    }

    static async createBatterySpecifications(variant_id, capacity, type, current, placement) {
        if (capacity != null) {
            const capacityAttr = await Attribute.findOne({ slug: 'battery-capacity' });
            await Specification.create({
                moduleId: variant_id,
                moduleType: "variant",
                attribute_name: "Battery Capacity",
                values: [{ value: capacity }],
                attributeId: capacityAttr._id,
                type: "specification",
                sub_type: "engine-transmission",
                sub_type_label: "Engine & Transmission",
                slug: "battery-capacity",
                unit: "kWh"
            });
            await SpecificationController.updateRanges(variant_id, capacityAttr._id, 'num', capacityAttr.slug.toLowerCase(), capacityAttr.unit);
        }

        if (type != null) {
            const typeAttr = await Attribute.findOne({ slug: 'battery-type' });
            await Specification.create({
                moduleId: variant_id,
                moduleType: "variant",
                attribute_name: "Battery Type",
                values: [{ value: type }],
                attributeId: typeAttr._id,
                type: "specification",
                sub_type: "engine-transmission",
                sub_type_label: "Engine & Transmission",
                slug: "battery-type",
                unit: ""
            });
        }

        if (current != null) {
            const currentAttr = await Attribute.findOne({ slug: 'battery-current' });
            await Specification.create({
                moduleId: variant_id,
                moduleType: "variant",
                attribute_name: "Battery Current",
                values: [{ value: current }],
                attributeId: currentAttr._id,
                type: "specification",
                sub_type: "engine-transmission",
                sub_type_label: "Engine & Transmission",
                slug: "battery-current",
                unit: "Volt"
            });
        }

        if (placement != null) {
            const placementAttr = await Attribute.findOne({ slug: 'battery-placement' });
            await Specification.create({
                moduleId: variant_id,
                moduleType: "variant",
                attribute_name: "Battery Placement",
                values: [{ value: placement }],
                attributeId: placementAttr._id,
                type: "specification",
                sub_type: "engine-transmission",
                sub_type_label: "Engine & Transmission",
                slug: "battery-placement",
                unit: ""
            });
        }
    }
    static async fixVariantName(req, res) {
        try {
            let updateResults = [];
            for (const element of req.body) {
                var oldName = element.variant_name.replace(/\(.*?\)/g, '').trim();
                var mappingName = element.variant_name.trim();
                var newName = element.variant_name.trim();
                var mname = element.model_name.replace(/\(.*?\)/g, '').trim();
                var bname = element.brand_name.replace(/\(.*?\)/g, '').trim();
                var modelWithoutBrand = mname.replace(new RegExp(bname, 'gi'), '').trim();
                oldName = oldName.replace(new RegExp(modelWithoutBrand, 'gi'), '').trim();
                newName = newName.replace(new RegExp(modelWithoutBrand, 'gi'), '').trim();
                var newSlug = await UploadController.slugify(newName);


                if (mappingName !== newName) {
                    console.log(`Old Name: ${oldName}, New Name: ${newName}`);
                    const variant = await Variant.findOne({ slug: newSlug });
                    if (variant) {
                        // variant.name = newName;
                        // variant.slug = await UploadController.slugify(newName);
                        variant.mapping_name = await UploadController.slugify(mappingName);
                        await variant.save();
                        updateResults.push({ oldName: oldName, newName: newName });
                    }
                }
            }
            if (updateResults.length > 0) {
                res.status(200).send({ message: 'Variant Name Updated Successfully', details: updateResults });
            } else {
                res.status(200).send({ message: 'No Variants Updated' });
            }
        } catch (err) {
            console.log("Variant Name change failed: " + err.message);
            return res.status(400).send({ message: err.message });
        }
    }
    static async fixSpecificationName(req, res) {
        try {
            for (const element of req.body) {
                const { key, variant_name, value } = element;

                const name = key.replace(/\(.*?\)/g, '').trim();
                const slug = await UploadController.slugify(name);
                const variant_slug = await UploadController.slugify(variant_name.trim());

                const variant = await Variant.findOne({ mapping_name: variant_slug.toLowerCase() });
                if (!variant) {
                    logger.error(`Variant: ${variant_name}, Specification: ${key}`);
                    continue;
                }

                const values = (value && typeof value === 'string')
                    ? value.trim()
                    : "no";

                const valuesArray = values.split(',')
                    .map(val => val.trim())
                    .filter(Boolean)
                    .map(value => ({ value }));

                const specification = await Specification.findOneAndUpdate(
                    { moduleId: variant._id, slug: slug.toLowerCase() },
                    { $set: { values: valuesArray } }
                );

                if (specification) {
                    console.log(`Variant: ${variant_name}, name: ${name}, values: ${values}`);
                }
            }

            console.log("Specification Name update completed successfully");
            return success(res, "Specifications uploaded successfully", 200);
        } catch (error) {
            console.log("Specification Upload failed: " + error.message);
            return failed(res, error.message, 400);
        }
    }
    static async fixVariantMappingName(req, res) {
        try {
            for (const element of req.body) {
                const name = element.variant_name.trim();
                const mname = element.model_name.trim();
                const bname = element.brand_name.trim();

                const modelWithoutBrand = mname.replace(new RegExp(bname, 'gi'), '').trim();
                const nameWithoutModel = name.replace(new RegExp(modelWithoutBrand, 'gi'), '').trim();

                const slug = await UploadController.slugify(nameWithoutModel);
                const model_slug = await UploadController.slugify(modelWithoutBrand);
                const mapping_name = await UploadController.slugify(name);

                const model = await Model.findOne({ slug: model_slug.toLowerCase() });

                if (model) {
                    const model_id = model._id;
                    var t = await Variant.findOneAndUpdate(
                        { modelId: model_id, slug: slug.toLowerCase() },
                        { mapping_name: mapping_name.toLowerCase() }
                    );
                    // console.log(t);

                } else {
                    logger.error(`Model not found for slug: ${model_slug}`);
                }
            }
            return success(res, "Variants Mapping name updated successfully", 200);
        } catch (error) {
            return failed(res, error.message, 400);
        }
    }
    static async fixS3Images(req, res) {
        try {
            const IMAGE_URL = 'https://virtualevent-fe.s3.ap-south-1.amazonaws.com/express-products/auto/images/';

            const { type } = req.query;
            console.log(type);
            switch (type) {
                case 'brand':
                    console.log(type);
                    const brands = await Brand.find({ deletedAt: null });
                    // console.log(brands);
                    for (const brand of brands) {
                        logger.info(`${brand.name} : ${brand.logo} : ${brand.seo_image}`);
                        if (brand.logo && brand.logo != null) {
                            const logoUrl = IMAGE_URL + brand.logo;
                            logger.info(`${logoUrl}`);
                            const logo_file = await downloadAndUploadToS3(logoUrl, `${brand.slug}-logo`);
                            brand.logo = logo_file;
                        }
                        if (brand.seo_image && brand.seo_image != null) {
                            const seoImageUrl = IMAGE_URL + brand.seo_image;
                            logger.info(`{seoImageUrl}`);
                            const seo_image_file = await downloadAndUploadToS3(seoImageUrl, `${brand.slug}-full-details`);
                            brand.seo_image = seo_image_file;
                        }
                        await brand.save();
                    }
                    break;
                case 'model':
                    const models = await Model.find({ deletedAt: null });
                    for (const model of models) {
                        logger.info(`${model.name} : ${model.seo_image}`);
                        if (model.seo_image && model.seo_image != null) {
                            const seoImageUrl = IMAGE_URL + model.seo_image;
                            const seo_image_file = await downloadAndUploadToS3(seoImageUrl, `${model.slug}-full-details`);
                            model.seo_image = seo_image_file;

                            await model.save();
                        }
                        try {
                            const medias = await Media.find({
                                moduleId: model._id,
                                'medias.media_type': 'image'
                            });
                            console.log(medias);
                            for (const mediaDoc of medias) {
                                for (const media of mediaDoc.medias) {
                                    logger.info(`${media} : ${media.source_path}`);

                                    if (media.media_type === 'image') {
                                        const imageUrl = IMAGE_URL + media.source_path;
                                        const image_file = await downloadAndUploadToS3(imageUrl, `${model.slug}-image-gallery`);
                                        media.source_path = image_file;
                                    }
                                }
                                await mediaDoc.save();
                            }
                        } catch (error) {
                            console.log({ message: error.message });
                        }
                    }
                    break;
                case 'variant':
                    const variants = await Variant.find({ deletedAt: null });
                    for (const variant of variants) {
                        console.log(variant.name);
                        logger.info(`${variant.name} : ${variant.seo_image}`);

                        if (variant.seo_image && variant.seo_image != null) {
                            const variantImageUrl = IMAGE_URL + variant.seo_image;
                            const model = await Model.findOne({ _id: variant.modelId });
                            console.log(model.name);
                            const variant_seo_image = await downloadAndUploadToS3(variantImageUrl, `${model.slug}-${variant.slug}-full-details`);
                            variant.seo_image = variant_seo_image;
                            await variant.save();
                        }
                    }
            }
            return res.json({ success: true, message: 'Images processed successfully' });
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    static async updateVariantDescriptions(req, res) {
        try {
            const variants = await Variant.find({ deletedAt: { $ne: null } });
            for (const variant of variants) {
                const description = await generateDescription(variant._id);
                variant.description = description;
                await variant.save();
            }
            return success(res, "Variants description updated successfully", 200);

        } catch (error) {
            console.log("Error updating variant Descriptions: " + error);
        }
    }

    static async fixDuplicateSpecification(req, res) {
        try {
            const { variant_slug } = req.body;

            if (!variant_slug) {
                return res.status(400).json({ message: 'Variant slug is required' });
            }

            // Assuming you have a Variant model to interact with the database
            const variant = await Variant.findOne({ slug: variant_slug });

            if (!variant) {
                return res.status(404).json({ message: 'Variant not found' });
            }

            // Assuming you have a Specification model to interact with the database
            const specifications = await Specification.find({ moduleId: variant._id });

            if (specifications.length === 0) {
                return res.status(404).json({ message: 'No specifications found for the given variant' });
            }

            const specMap = new Map();
            const duplicates = [];

            specifications.forEach(spec => {
                if (specMap.has(spec.attribute_name)) {
                    duplicates.push(spec._id);
                } else {
                    specMap.set(spec.attribute_name, spec._id);
                }
            });

            if (duplicates.length > 0) {
                await Specification.deleteMany({ _id: { $in: duplicates } });
            }

            res.status(200).json({ message: 'Duplicate specifications removed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred while fixing duplicate specifications' });
        }
    }
}