import { Op, Sequelize } from 'sequelize';
import moment from 'moment-timezone';
import { CommoditiesTopContentFormat } from '../Models/Commodities/CommoditiesTopContentFormat.mjs';
import { CommoditiesMaster } from '../Models/Commodities/CommoditiesMaster.mjs';

export const getTopContentFormat = async (name, city) => {
  const result = await CommoditiesTopContentFormat.findOne({
    where: { name, city },
    attributes: ['format']
  });
  return result?.format;
};

const findCommodityByNameAndTypeAndCity = async (name, type, city) => {
  return await CommoditiesMaster.findAll({
    where: {
      name,
      type,
      city,
    }
  });
}
const priceFormat = (price) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let formattedPrice = formatter.format(price);
  if (formattedPrice.endsWith('.00')) {
    formattedPrice = formattedPrice.slice(0, -3);
  }
  return formattedPrice;
};

export const generateTopContent = async (name, city) => {
  try {

    const format = await getTopContentFormat(name, city);
    // const actualCity = city === 'India' ? 'Mumbai' : city;

    // const [master24Carat, master22Carat] = await Promise.all([
    //   findCommodityByNameAndTypeAndCity(name, '24 Carat', actualCity),
    //   findCommodityByNameAndTypeAndCity(name, '22 Carat', actualCity),
    // ]);

    // const replacements = {
    //   '<1-gram-price(24Carat)>': priceFormat(master24Carat[0].last_price),
    //   '<1-gram-price(22Carat)>': priceFormat(master22Carat[0].last_price),
    //   '-<city-name>': `-${city.toLowerCase()}`,
    //   '<city-name>': city,
    //   '<todays-date>': moment().format('MMM DD, YYYY')
    // };

    let content = format;

    // for (const [key, value] of Object.entries(replacements)) {
    //   const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    //   const regex = new RegExp(escapedKey, 'g');
    //   content = content.replace(regex, value);
    // }
    return content;
  } catch (error) {
    console.error('Error generating content:', error);
  }
}
