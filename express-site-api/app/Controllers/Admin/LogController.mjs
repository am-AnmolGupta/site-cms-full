import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LogController {

    static async getLog(req, res) {
        try {
            const logsFolder = path.join(__dirname, '../../../logs');

            function getFormattedDate(date) {
                const now = date ? new Date(date) : new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            const { type, date } = req.query;

            if (!type) {
                return res.status(400).json({ error: 'Type parameter is required' });
            }

            const formattedDate = getFormattedDate(date);

            let filename;
            if (type === 'access') {
                filename = `${formattedDate}-access.log`;
            } else if (type === 'error') {
                filename = `${formattedDate}-error.log`;
            } else if (type === 'query') {
                filename = `${formattedDate}-query.log`;
            } else {
                return res.status(400).json({ error: 'Invalid log type' });
            }

            let filePath = path.join(logsFolder, filename);

            // Check if .gz file exists
            if (!fs.existsSync(filePath)) {
                filePath = `${filePath}.gz`;
            }

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'Log file not found' });
            }

            // Read and decompress the file if it's gzipped
            const readLogFile = filePath.endsWith('.gz') ? decompressLogFile : readFile;

            readLogFile(filePath, (err, data) => {
                if (err) {
                    console.error(`Error reading file: ${filePath}`, err);
                    return res.status(500).json({ error: 'Failed to read log file' });
                }

                // Get file stats to include file size and updated date
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error(`Error getting stats for file: ${filePath}`, err);
                        return res.status(500).json({ error: 'Failed to read file stats' });
                    }

                    // Extract relevant information
                    const updatedOn = stats.mtime; // Last modified date
                    const fileSize = (stats.size / 1024).toFixed(2); // File size in bytes

                    // Send the file contents and additional details in the response
                    res.json({ logs: data, updatedOn, fileSize });
                });
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
}

function readFile(filePath, callback) {
    fs.readFile(filePath, 'utf8', callback);
}

function decompressLogFile(filePath, callback) {
    const buffer = [];
    fs.createReadStream(filePath)
        .pipe(zlib.createGunzip())
        .on('data', (data) => buffer.push(data.toString()))
        .on('end', () => callback(null, buffer.join('')))
        .on('error', (err) => callback(err));
}
