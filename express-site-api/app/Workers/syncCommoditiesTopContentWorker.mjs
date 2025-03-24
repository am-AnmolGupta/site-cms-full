import { parentPort } from 'worker_threads';
import { CommodityContentGenerateController } from '../Controllers/CommodityAdmin/CommodityContentGenerateController.mjs';
async function syncCommoditiesTopContentWorker() {
  try {
    await CommodityContentGenerateController.syncTopContent();

    parentPort.postMessage({
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    parentPort.postMessage({
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
}

syncCommoditiesTopContentWorker();