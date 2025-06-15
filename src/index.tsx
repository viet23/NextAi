import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "./assets/scss/style.scss";
import { Provider } from 'react-redux';
// import store from './store/store';
import { AppProvider } from './context/AppContext';
import './i18n';
import { persistor, store } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { App as AntdApp } from 'antd';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AntdApp> {/* ✅ Bọc ở đây */}
        <AppProvider>
          <App />
        </AppProvider>
      </AntdApp>
    </PersistGate>
  </Provider>
);

reportWebVitals();
