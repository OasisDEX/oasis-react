export default () =>  {
  let first = true;
  return store => next => action => {

    if(first) {
      first = false;
      return next(action);
    }

    if (action instanceof Array) {
      const [thunk, ...args] = action;
      return next({type: 'deferred-thunk', payload: {thunk, thunkName: thunk.name, args}});
    } else if (typeof action === 'function') {
      return next({type: 'thunk', payload: {thunk: action, thunkName: action.name}});
    } else {
      return next(action);
    }
  }
}