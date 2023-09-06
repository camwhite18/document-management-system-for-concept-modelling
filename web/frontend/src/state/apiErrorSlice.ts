import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { APIError } from "../services/apiError";
import { toast } from "react-toastify";
import { appDispatch } from "./dispatch";
import ErrorToast from "../components/alerts/ErrorToast";

const initialState: Record<string, APIError> = {};

const apiErrorsSlice = createSlice({
    name: "apiErrors",
    initialState,
    reducers: {
        addAPIError(state, action: PayloadAction<APIError>) {
            const id = guidGenerator();
            if (!action.payload.url?.includes("/user/")) {
                toast(ErrorToast(action.payload), {
                    type: action.payload.severity,
                    onClose: () => {
                        appDispatch(removeAPIError(id));
                    },
                });
            }
            return {...state, [id]: action.payload};
        },
        removeAPIError(state, action: PayloadAction<string>) {
            delete state[action.payload];
            return state;
        },
    },
});

export const { addAPIError, removeAPIError } = apiErrorsSlice.actions;
export default apiErrorsSlice.reducer;


const guidGenerator = (): string => {
    const S4 = (): string => {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
};
