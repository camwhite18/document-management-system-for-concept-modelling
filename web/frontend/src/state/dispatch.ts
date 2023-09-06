import store from "./store";
import { AnyAction } from "redux";

export const appDispatch = (action: AnyAction): void => {
    store.dispatch(action);
};
