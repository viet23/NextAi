import {configureStore} from '@reduxjs/toolkit'
import { persistStore } from 'redux-persist';
import rootReducer from './reduces'
import { api } from './api/base'
const store = configureStore({
    reducer: rootReducer, 
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/FLUSH',
        ],
      }}).concat(api.middleware)
})
const persistor = persistStore(store);
export { store, persistor };

// export default store