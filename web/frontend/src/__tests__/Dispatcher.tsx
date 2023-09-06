import { FunctionComponent } from "react";
import {useDispatch} from "../state/hooks";
import {AsyncThunk} from "@reduxjs/toolkit";

type TestDispatcherProps = {
    Component: FunctionComponent;
    thunk: AsyncThunk<{}, any, {}>;
    data?: string;
};

const Dispatcher: FunctionComponent<TestDispatcherProps> = ({ Component, thunk, data }: TestDispatcherProps) => {
    const dispatch = useDispatch();
    dispatch(thunk(data));

    return <Component />;
};

export default Dispatcher;
