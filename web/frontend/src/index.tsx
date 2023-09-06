import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min'
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store, { persistor } from "./state/store";
import { HashRouter, Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import { protectedRoutes, routeLogin, routeNoMatch, routes } from "./variables/routes";
import styles from "./css/main.module.css"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUser } from "./state/userSlice";
import { useDispatch } from "./state/hooks";
import { PersistGate } from 'redux-persist/integration/react';
import { ProtectedRoute } from "./variables/ProtectedRoute";
import "allotment/dist/style.css";
import ReactTooltip from "react-tooltip";


function App() {
    const dispatch = useDispatch();

    //Only init state once
    useEffect(() => {
        //fill store
        dispatch(fetchUser());
    }, []);

    return (
        <div className={styles.wrapper}>
            <Header />
            <div className={styles.full_height}>
                <Routes>
                    <Route path={routeLogin.path} element={<routeLogin.component />} />
                    {routes.map((route) => {
                        return <Route path={route.path} element={<route.component />} key={route.name} />;
                    })}
                    {protectedRoutes.map((route) => {
                        return <Route path={route.path} element={
                            <ProtectedRoute>
                                <route.component />
                            </ProtectedRoute>
                        } key={route.name} />;
                    })}
                    <Route path={routeNoMatch.path} element={<routeNoMatch.component />} />
                </Routes>
            </div>
            <ReactTooltip
                effect={"solid"}
                place={"right"}
                multiline={true}
                delayShow={500}
                className={styles.tooltip_opacity}
            />
        </div>
    );
}

const container = document.getElementById('application');
const root = createRoot(container!);
root.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <HashRouter>
                <App />
            </HashRouter>
            <ToastContainer position="bottom-right" autoClose={10000} limit={5} />
        </PersistGate>
    </Provider>
);
