import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from 'redis';
import express from 'express';
const app = express();


const getCurrentDirname = () => {
    const currentDir = fileURLToPath(import.meta.url);
    const rootDir = resolve(currentDir, '../../');
    return dirname(rootDir);
};

const createCacheFileName = (api_url) => {
    const url = api_url.slice(1).split('/');
    const formatedUrl = url.join('_');
    return `${formatedUrl}.json`;
};

const saveDataToCache = (data, key) => {
    var cachedriver = process.env.CACHE_DRIVER ?? "file";
    if (cachedriver == 'file') {
        try {
            fs.writeFileSync(getCurrentDirname() + '/cache/' + key, JSON.stringify(data), "utf8");
        }
        catch (error) {
        }
    }
    else if (cachedriver == 'redis') {
        // const redisClient = createClient({
        //     username: 'default',
        //     password: 'secret', 
        //     socket: {
        //         host: 'my-redis.cloud.redislabs.com',
        //         port: 6379,
        //         tls: true,
        //         key: readFileSync('./redis_user_private.key'),
        //         cert: readFileSync('./redis_user.crt'),
        //         ca: [readFileSync('./redis_ca.pem')]
        //     }
        // });
        const redisClient = createClient();
        redisClient.connect();
        return redisClient.set(key, data);

    }
};

const getCachedDataFromCache = (key) => {
    try {
        var cachedriver = process.env.CACHE_DRIVER ?? "file";
        if (cachedriver == 'file') {
            try {
                var filePath = getCurrentDirname() + '/cache/' + key;
                const stats = fs.statSync(filePath);
                if (stats && stats.mtime) {
                    const currentTime = new Date();
                    const modifiedTime = stats.mtime;
                    const timeDifference = Math.abs(currentTime - modifiedTime);
                    const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60));

                    if (timeDifferenceInMinutes < 6) {
                        const data = fs.readFileSync(filePath, "utf8");
                        return JSON.parse(data);
                    }
                }
            } catch (error) {
            }

        }
        else if (cachedriver == 'redis') {
            // const redisClient = createClient({
            //     username: 'default',
            //     password: 'secret', 
            //     socket: {
            //         host: 'my-redis.cloud.redislabs.com',
            //         port: 6379,
            //         tls: true,
            //         key: readFileSync('./redis_user_private.key'),
            //         cert: readFileSync('./redis_user.crt'),
            //         ca: [readFileSync('./redis_ca.pem')]
            //     }
            // });
            const redisClient = createClient();
            redisClient.connect();
            return redisClient.get(key);
        }

    } catch (error) {
        console.error(`Error reading cache file: ${error.message}`);
        return null;
    }
};

const getKey = (url) => {

    const filename = createCacheFileName(url);
    var url = (url.slice(1).split('/')).join('_') + '.json';
    const key = filename.replace("?", "___");
    return key;
}

const getData = (key) => {
    try {
        var cachedData = getCachedDataFromCache(key);
        if (cachedData) {
            return cachedData;
        }
        return null;

    } catch (error) {
        console.error(`Error reading cache file: ${error.message}`);
        return error;
    }

}

export { getData, saveDataToCache, getKey }