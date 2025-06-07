import {combineReducers} from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // sử dụng localStorage
import appReducer from '../slice/app.slice'
import authReducer from '../slice/auth.slice'
import { api } from '../../store/api/base'
const persistConfig = {
    key: 'auth',
    storage,
  };
// const persistedReducer = persistReducer(persistConfig, authReducer);

const rootReducer = combineReducers({
    [api.reducerPath]: api.reducer,
    app: appReducer, 
    auth: persistReducer(persistConfig, authReducer),

})
export default rootReducer