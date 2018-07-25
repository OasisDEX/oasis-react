import web3 from "./web3";
import { ERRORS } from "../utils/errorCodes";
import {
  PROVIDER_TYPE_METAMASK,
  PROVIDER_TYPE_MIST,
} from '../constants';

export const checkConnectivity = () =>
  (() => {
    return new Promise((resolve, reject) => {
      const tid = setTimeout(() => reject(ERRORS.NO_CONNECTION), 4000);
      if (!window.mist) {
        web3.version.getNode((error, result) => {
          clearTimeout(tid);
          const extensionIsInitiallyLoaded = !error && result;
          if (extensionIsInitiallyLoaded) {
            resolve(PROVIDER_TYPE_METAMASK);
          } else reject(ERRORS.NO_CONNECTION);
        });
      } else {
        clearTimeout(tid);
        resolve(PROVIDER_TYPE_MIST);
      }
    });
  })();
