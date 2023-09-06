import React from "react";
import { FunctionComponent } from "react";
import { Provider } from "react-redux";
import { AsyncThunk } from "@reduxjs/toolkit";
import { Route , MemoryRouter, Routes } from "react-router-dom";
import Dispatcher from "./Dispatcher";
import store from "../state/store";

type TesterProps = {
    Component: FunctionComponent;
    thunk?: AsyncThunk<{}, any, {}>; //optional props
    data?: string;
    props?: object;
    pathTemplate?: string;
    memoryRouterPath?: string;
};

const Tester: FunctionComponent<TesterProps> = ({ Component, thunk, data, props, pathTemplate = "/", memoryRouterPath = "/"}: TesterProps) => {
    return (
        <Provider store={store}>
            <MemoryRouter initialEntries={[memoryRouterPath]}>
                <Routes>
                    {thunk ? (
                        <Route path={pathTemplate}>
                            <Dispatcher Component={Component} thunk={thunk} data={data} />
                        </Route>
                    ) : (
                        <Route path={pathTemplate} element={<Component {...props} />} />
                    )}
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

export default Tester;
