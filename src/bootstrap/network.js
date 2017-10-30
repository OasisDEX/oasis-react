import web3 from './web3';
import {ERRORS} from '../utils/errorCodes';

export function checkConnectivity() {
  return (() => {
    return new Promise((resolve, reject) => {

      web3.version.getNode((error, result) => {
        const isConnected = !error && result;

        if(isConnected) resolve(isConnected);
        else reject(ERRORS.NO_CONNECTION)
      });

    });
  })();
}