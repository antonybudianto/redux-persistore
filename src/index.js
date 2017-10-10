import * as _ from 'lodash';

const defaultConfig = {
  list: [],
  prefix: ''
};

function generatePath (prefix, path) {
  if (prefix) {
    return [prefix, ...path.split('.')].join('-');
  }
  return path.split('.').join('-');
}

export function persistStore (store, config = defaultConfig) {
  const { list, prefix } = config;
  let prevState = getInitialState(config);
  store.subscribe(() => {
    const state = store.getState();

    list.forEach(p => {
      let currentValue = _.get(state, p.path);
      const prevValue = _.get(prevState, p.path);
      if (!_.isEqual(currentValue, prevValue)) {
        if (currentValue instanceof Array) {
          currentValue = JSON.stringify(currentValue);
        }
        let path = generatePath(prefix, p.path);
        localStorage.setItem(path, currentValue);
      }
    });

    prevState = state;
  });
}

export function getInitialState (config = defaultConfig) {
  const { list, prefix } = config;
  const initialState = {};
  list.forEach(p => {
    const path = generatePath(prefix, p.path);
    let data = localStorage.getItem(path);
    if (data) {
      if (p.isArray) {
        data = JSON.parse(data);
      }
      _.set(initialState, p.path, data);
    }
  });
  return initialState;
}
