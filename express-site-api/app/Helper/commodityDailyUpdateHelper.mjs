import { Op, Sequelize } from 'sequelize';
import moment from 'moment-timezone';
import { CommoditiesDailyUpdatesFormat } from '../Models/Commodities/CommoditiesDailyUpdatesFormat.mjs';
import { CommoditiesMaster } from '../Models/Commodities/CommoditiesMaster.mjs';
import { CommoditiesEodMaster } from '../Models/Commodities/CommoditiesEodMaster.mjs';

// Helper function to find commodities by name, type and city
const findCommodityByNameAndTypeAndCity = async (name, type, city, date) => {
  const today = moment().format('YYYY-MM-DD');
  if (date === today) {
    return await CommoditiesMaster.findAll({
      where: {
        name,
        type,
        city,
        date: Sequelize.literal(`date = '${date}'`)
      }
    });
  } else {
    return await CommoditiesEodMaster.findAll({
      where: {
        name,
        type,
        city,
        date: Sequelize.literal(`date = '${date}'`)
      }
    });
  }
};

// Helper function to get format for the day
const getTodaysFormat = async (name, city, day) => {
  const result = await CommoditiesDailyUpdatesFormat.findOne({
    where: { name, city, day },
    attributes: ['format']
  });
  return result?.format;
};

// Format price in Indian numbering system
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

// Main function to generate daily update content
export const generateDailyUpdateContent = async (name, city, date) => {
  try {
    // Parse the date from DD-MM-YYYY format
    const today = moment(date, 'YYYY-MM-DD');
    if (!today.isValid()) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    const yesterday = moment(today).subtract(1, 'days');

    console.log(today, yesterday)
    // Get format for the day
    const dayIndex = city === 'India'
      ? (today.date() === 31 ? (today.date() - 1) % 30 : today.date() % 30)
      : (today.date() === 31 ? (today.date() - 1) % 15 : today.date() % 15);

    const format = await getTodaysFormat(name, city, dayIndex);
    if (!format) {
      console.log(`No format found for ${name}, ${city}, day ${dayIndex}`);
      return null;
    }

    // Get commodity data
    const actualCity = city === 'India' ? 'Mumbai' : city;
    console.log(actualCity);
    const [master24Carat, master22Carat, master18Carat] = await Promise.all([
      findCommodityByNameAndTypeAndCity(name, '24 Carat', actualCity, today.format('YYYY-MM-DD')),
      findCommodityByNameAndTypeAndCity(name, '22 Carat', actualCity, today.format('YYYY-MM-DD')),
      findCommodityByNameAndTypeAndCity(name, '18 Carat', actualCity, today.format('YYYY-MM-DD'))
    ]);

    if (!master24Carat?.length) {
      console.log(`No data found for ${name} in ${actualCity}`);
      return null;
    }

    // Calculate change percentage
    const changePercent24Carat = (
      (master24Carat[0].last_price - master24Carat[0].prev_close) /
      master24Carat[0].prev_close
    ) * 100;

    const formattedChangePercent24Carat = changePercent24Carat.toFixed(2);

    // Get direction words based on change
    const directionWords = {
      changeTicker: changePercent24Carat < 0 ? 'down' : 'up',
      incDec: changePercent24Carat < 0 ? 'decrease' : 'increase',
      srgDrp: changePercent24Carat < 0 ? 'drop' : 'surge',
      advDec: changePercent24Carat < 0 ? 'decline' : 'advance',
      moreLess: changePercent24Carat < 0 ? 'less' : 'more',
      upDownWard: changePercent24Carat < 0 ? 'downward' : 'upward',
      upperLower: changePercent24Carat < 0 ? 'lower' : 'upper',
      move: changePercent24Carat < 0 ? 'downmove' : 'upmove',
      abvBel: changePercent24Carat < 0 ? 'below' : 'above'
    };

    // Create replacements object
    const replacements = {
      '<10-gram-price(24Carat)>': priceFormat(master24Carat[0].last_price * 10),
      '<10-gram-change-percent(24Carat)>': formattedChangePercent24Carat,
      '<change-ticker>': directionWords.changeTicker,
      '<inc-dec>': directionWords.incDec,
      '<upward-downward>': directionWords.upDownWard,
      '<upper-lower>': directionWords.upperLower,
      '<upmove-downmove>': directionWords.move,
      '<adv-dec>': directionWords.advDec,
      '<above-below>': directionWords.abvBel,
      '<more-less>': directionWords.moreLess,
      '<srg-drp>': directionWords.srgDrp,
      '<yesterdays-date>': yesterday.format('MMMM D, YYYY'),
      '<todays-date>': today.format('MMMM D, YYYY'),
      '<yesterday>': yesterday.format('D'),
      '<yesterdays-day>': yesterday.format('MMMM D'),
      '<todays-day>': today.format('MMMM D'),
      '<city-name>': city,
      '<1-gram-price(24Carat)>': priceFormat(master24Carat[0].last_price),
      '<10-gram-price(22Carat)>': priceFormat(master22Carat[0].last_price * 10),
      '<1-gram-price(22Carat)>': priceFormat(master22Carat[0].last_price),
      '<10-gram-yesterday-price(24 Carat)>': priceFormat(master24Carat[0].prev_close * 10),
      '<1-gram-price(18Carat)>': priceFormat(master18Carat[0].last_price),
      '<10-gram-price(18Carat)>': priceFormat(master18Carat[0].last_price * 10)
    };

    // Generate content
    let content = format;

    for (const [key, value] of Object.entries(replacements)) {
      // Escape special characters in the key
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedKey, 'g');

      // if (regex.test(content)) {
      //   console.log(`Match found for key: "${key}" | Replacing with value: "${value}"`);
      // } else {
      //   console.log(`No match found for key: "${key}"`);
      // }

      content = content.replace(regex, value);
    }
    return `<p>${content}</p>`;

  } catch (error) {
    console.error('Error generating content:', error);
  }
};