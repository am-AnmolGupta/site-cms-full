import { CommoditiesStaticContent } from "../Models/Commodities/CommoditiesStaticContent.mjs";
import logger from "./logger.mjs";
const seoData = {
  "GOLD": {
    "India": {
      "seo_title": "Today's Gold Rate in India: Gold Price Today, 18, 22 & 24 Carat Gold Rate Today",
      "seo_description": "Today's Gold Rate in India: Check for Gold Price in India today for 18, 22 and 24 carat in major cities. Find the Last 10 days' gold rate in India for 1gm, 8 gm, 10gm, and 100 gm on financialexpress.com.",
      "seo_keywords": "gold rate today, gold price today, gold price, gold rate, 1 gram gold rate today, 18ct gold price today, gold rate today 18k, 22ct gold price today, gold rate today 22k, 24ct gold price today, gold price today 22k, mcx gold, 22 carat gold rate today, indian gold rate today"
    },
    "Other": {
      "seo_title": "Today's Gold Rate in {{city}}: 18, 22 and 24 Carat Gold Price in {{city}} Today Live",
      "seo_description": "Today's Gold Rate in {{city}}: Check for gold price in {{city}} today and the last 10 days of gold rate in {{city}} for 18, 22 and 24 carat based on 1gm, 8gm, 10gm, and 100 gm on financialexpress.com.",
      "seo_keywords": "gold rate today {{city}}, gold price today {{city}}, today gold rate in {{city}}, gold price today in {{city}}, today gold rate in {{city}} 22 carat, 22 carat gold rate in {{city}} today, 916 gold rate today {{city}}, today gold rate in {{city}} 24 carat, gold price {{city}}, today gold rate {{city}} 1 gram, 916 gold rate in {{city}}, hallmark gold price today in {{city}}, 18 carat gold rate in {{city}}, 18 carat price today in {{city}}"
    }
  },
  "SILVER": {
    "city": {
      "seo_title": "Silver Rate Today in {{city}}: Today's Silver Price in {{city}}, 10 Gm, 1 Kg Chandi Price in {{city}}",
      "seo_description": "Silver Rate Today in {{city}}: Check here today's silver price in {{city}} for 1gm, 10gm, 1 kg on financialexpress.com. Get silver price today in {{city}} and also check last 10 days, weekly, monthly silver price in {{city}} here.",
      "seo_keywords": "silver price in {{city}}, silver price today {{city}}, silver price in {{city}}, 10 gram silver price in {{city}}, 1 gram silver price in {{city}}, silver price today live in {{city}}, silver rate in {{city}}, silver rate today in {{city}}, 1 kg silver price in {{city}}, 1kg silver bar price in {{city}}"
    }
  },
  "PETROL": {
    "India": {
      "seo_title": "Petrol Price Today {{date}} in India: Today's Petrol Rate in India, Petrol Price Today",
      "seo_description": "Petrol Price Today {{date}} in India: Check here today's petrol price in India for 1 litre on financialexpress.com. Also check petrol rate today and also check last 10 days, weekly and monthly petrol price in India here.",
      "seo_keywords": "petrol price, petrol price today, today petrol rate, petrol rate, petrol price today in india, fuel prices, fuel prices today in india, 1 litre petrol price, last 10 days petrol price, previous day petrol price"
    },
    "Other": {
      "seo_title": "Petrol Price Today in {{city}}: Petrol Rate in {{city}} Today, 1 Litre Petrol Price Today in {{city}}",
      "seo_description": "Petrol Price Today in {{city}}: Check today's petrol rate in {{city}} for 1 litre on financialexpress.com. Also check petrol rate for today, and last 10 days, weekly and monthly petrol price in {{city}} here.",
      "seo_keywords": "petrol price in {{city}}, petrol price in {{city}} today, petrol price in {{city}} today live, petrol rate {{city}}, petrol rate in {{city}}, petrol rate today {{city}}, petrol rate today {{city}}, 1 litre petrol price {{city}}, 1 litre petrol price in {{city}} today"
    }
  },
  "DIESEL": {
    "India": {
      "seo_title": "Diesel Price Today {{date}} in India: Today's Diesel Rate in India, Diesel Price Today",
      "seo_description": "Diesel Price Today {{date}} in India: Check here today's diesel price in India for 1 litre on financialexpress.com. Also check diesel rate today and also check last 10 days, weekly and monthly diesel price in India here.",
      "seo_keywords": "diesel price, diesel price today, today diesel rate, diesel rate, diesel price today in india, fuel prices, fuel prices today in india, 1 litre diesel price, last 10 days diesel price, previous day diesel price"
    },
    "Other": {
      "seo_title": "Diesel Price Today in {{city}}: Diesel Rate in {{city}} Today, 1 Litre Diesel Price Today in {{city}}",
      "seo_description": "Diesel Price Today in {{city}}: Check today's diesel rate in {{city}} for 1 litre on financialexpress.com. Also check diesel rate for today, and last 10 days, weekly and monthly diesel price in {{city}} here.",
      "seo_keywords": "diesel price in {{city}}, diesel price in {{city}} today, diesel price in {{city}} today live, diesel rate {{city}}, diesel rate in {{city}}, diesel rate today {{city}}, diesel rate today {{city}}, 1 litre diesel price {{city}}, 1 litre diesel price in {{city}} today"
    }
  }

};
const getTodayformatDate = () => {
  const date = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
export const generateSeoMeta = async (name, city) => {
  try {
    let formattedCity;
    if (name === "GOLD" || name === "PETROL" || name === "DIESEL") {
      formattedCity = city === "India" ? "India" : "Other";
    } else if (name === "SILVER") {
      formattedCity = "city";
    }
    const todayDate = getTodayformatDate();

    console.log(name, formattedCity);
    if (seoData[name] && seoData[name][formattedCity]) {
      console.log(`SEO metadata found for name: ${name} and city: ${city}`);
      const metadata = { ...seoData[name][formattedCity] };
      console.log(metadata);
      Object.keys(metadata).forEach((key) => {
        metadata[key] = metadata[key].replace(/{{city}}/g, city);
        metadata[key] = metadata[key].replace(/{{date}}/g, todayDate);
      });

      return metadata;
    } else {
      throw new Error(`No SEO metadata found for name: ${name} and city: ${city}`);
    }
  } catch (error) {
    console.error("Error generating SEO metadata:", error.message);
    return null;
  }
};

export const updateSeoMeta = async (name, city) => {
  try {
    const seoMeta = await generateSeoMeta(name, city);
    await CommoditiesStaticContent.update(
      { seo_title: seoMeta.seo_title, seo_description: seoMeta.seo_description, seo_keywords: seoMeta.seo_keywords },
      { where: { name: name, city: city } }
    );
    logger.info(`SEO Meta updated for commodity: ${name}, ${city}`);
    return true;
  } catch (error) {
    console.error("Error updating SEO metadata:", error.message);
    return null;
  }
}