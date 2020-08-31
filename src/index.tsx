import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { App } from './App'
import { GlobalStyle } from './GlobalStyle'
import { reducer } from './reducer'

const store = createStore(
  reducer,
  // chrome拡張機能のRedux DevToolsによるストアのデバッグを可能とする。
  undefined,
  process.env.NODE_ENV === 'development'
    ? window.__REDUX_DEVTOOLS_EXTENSION__?.()
    : undefined,
)

ReactDOM.render(
  <Provider store={store}>
    <GlobalStyle />
    <App />
  </Provider>,
  document.getElementById('app'),
)
