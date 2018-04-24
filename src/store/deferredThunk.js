export const deferredThunk = () => next => action => {
  if (action instanceof Array) {
    const [thunk, ...args] = action;
    return next(thunk(...args));
  } else {
    return next(action);
  }
}

export const defer = (...args) => args