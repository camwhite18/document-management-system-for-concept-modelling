import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getTokens, LoginDetails, Tokens } from "../services/auth";

const initialState: Tokens = {
    access: undefined,
    refresh: undefined,
};

export const fetchTokens = createAsyncThunk("auth/fetchTokens", async (loginDetails: LoginDetails) => {
    const response = await getTokens(loginDetails).catch(() => {
        return undefined;
    });
    return !response ? initialState : response;
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        authUpdated(state, action: PayloadAction<Tokens>) {
            return { ...state, ...action.payload };
        },
        authFlush(state) {
            return { ...state, ...initialState };
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTokens.fulfilled, (state, action) => {
            return { ...state, ...action.payload };
        });
    },
});

export const { authUpdated, authFlush } = authSlice.actions;
export default authSlice.reducer;