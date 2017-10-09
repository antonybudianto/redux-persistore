import * as _ from 'lodash'

const defaultConfig = {
  list: [],
  prefix: ''
}

export function persistStore (store, config = defaultConfig) {
  const { list, prefix } = config
  let prevState = null
  store.subscribe(() => {
    const state = store.getState()

    if (prevState === state) {
      return
    }

    list.forEach(p => {
      let currentValue = _.get(state, p.path)
      const prevValue = _.get(prevState, p.path)
      if (currentValue !== prevValue) {
        if (currentValue instanceof Array) {
          currentValue = JSON.stringify(currentValue)
        }
        let path = [prefix, ...p.path.split('.')].join('-')
        localStorage.setItem(path, currentValue)
      }
    })

    prevState = state
  })
}

export function getInitialState (config = defaultConfig) {
  const { list, prefix } = config
  const initialState = {}
  list.forEach(p => {
    const path = [prefix, ...p.path.split('.')].join('-')
    let data = localStorage.getItem(path)
    if (data) {
      if (p.isArray) {
        data = JSON.parse(data)
      }
      _.set(initialState, p.path, data)
    }
  })
  return initialState
}
