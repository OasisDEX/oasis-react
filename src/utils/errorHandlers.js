import { ERRORS } from './errorCodes';

import { onMissingConnection } from './onMissingConnection';

const handlers = {
  [ERRORS.NO_CONNECTION]: onMissingConnection,
};

class ErrorHandler {
  handle(error) {
    console.log('ErrorHandler', error);
    const handler = handlers[error];
    if (!handler) {
      throw new Error('Platform error:', error);
    }

    handler(error);
  }
}

export const errorHandler = new ErrorHandler();