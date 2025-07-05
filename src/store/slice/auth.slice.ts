import { createSlice } from "@reduxjs/toolkit";
import { IAuthState } from "../../interfaces/auth.interface";
const initialState: IAuthState = {
  user: {},
  isLogin: false,
  batchOtpExpired: null,
  token: null,
  refreshToken: null,
  merchant: null,
  roles: [],
  groups: [],
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.user = action.payload;
    },
    setIsLogin: (state, action) => {
      state.isLogin = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    setBatchOtpExpired: (state, action) => {
      state.batchOtpExpired = action.payload;
    },
    setCurrentMerchant: (state, action) => {
      state.merchant = action.payload;
    },
    setRoles: (state, action) => {
      state.roles = action.payload;
    },
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
  },
});
export const {
  setCurrentUser,
  setIsLogin,
  setBatchOtpExpired,
  setToken,
  setRefreshToken,
  setCurrentMerchant,
  setRoles,
  setGroups,
} = authSlice.actions;
export default authSlice.reducer;
