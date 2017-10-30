import { ERRORS } from "./errorCodes"

import { onMissingConnection } from "./onMissingConnection";

const handlers = {
  [ERRORS.NO_CONNECTION]: onMissingConnection
};

class ErrorHandler {
  handle(error) {
     const handler = handlers[error];
     if(!handler) {
       throw new Error("Unknown error:", error);
     }

     handler(error);
  }
}

export const errorHandler =  new ErrorHandler();