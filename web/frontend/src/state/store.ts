import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import apiErrorReducer from "./apiErrorSlice";
import { CookieStorage } from 'redux-persist-cookie-storage'
import Cookies from 'cookies-js'
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
    key: 'root',
    storage: new CookieStorage(Cookies, {
        expiration: {
            'default': 1800 // Cookies expire after 30 minutes
        }
    })
}

const persistedReducer = persistReducer(persistConfig, authReducer)

const store = configureStore({
    reducer: {
        persistedReducer,
        user: userReducer,
        apiErrors: apiErrorReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
export const persistor = persistStore(store)
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {user: UserState}
export type AppDispatch = typeof store.dispatch;
