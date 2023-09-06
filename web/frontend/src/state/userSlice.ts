import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getUser, User } from "../services/user";
import store from "./store";

const initialState: User = {
    username: undefined,
    create_projects: false,
    project_permissions: {},
};

export const fetchUser = createAsyncThunk("user/fetchUser", async () => {
    // Prevent the user from being fetched if the user is not logged in.
    if (store.getState().persistedReducer.access === undefined) {
        return initialState;
    }
    const response = await getUser().catch(() => {
        return undefined;
    });
    return !response ? initialState : response;
});

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        userUpdated(state, action: PayloadAction<User>) {
            return { ...state, ...action.payload };
        },
        userFlush(state) {
            return { ...state, ...initialState };
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            return { ...state, ...action.payload };
        });
    },
});

export const { userUpdated, userFlush } = userSlice.actions;
export default userSlice.reducer;

