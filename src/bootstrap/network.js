import web3 from "./web3";
import { ERRORS } from "../utils/errorCodes";

export function checkConnectivity() {
  return (() => {
    return new Promise((resolve, reject) => {
      const tid = setTimeout(() => reject(ERRORS.NO_CONNECTION), 2000);
      web3.version.getNode((error, result) => {
        clearTimeout(tid);
        const extensionIsInitiallyLoaded = !error && result;
        if (extensionIsInitiallyLoaded) resolve(result);
        else reject(ERRORS.NO_CONNECTION);
      });
    });
  })();
}
