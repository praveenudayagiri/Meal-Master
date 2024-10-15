import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        gmail: null,
        likedMeals: []
    },
    reducers: {
        addUser: (state, action) => {
            return {
                ...state,
                ...action.payload
            };
        },
        removeUser: () => {
            return {
                gmail: null,
                likedMeals: []
            };
        },
    },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
