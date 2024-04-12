import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  userName: ""
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      let { _id = "", userName = "" } = action.payload;
      state._id = _id;
      state.userName = userName;
    },
    clearUser: (state) => {
      state._id = ""
      state.userName = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
