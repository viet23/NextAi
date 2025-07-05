import { IAppMenuState } from "../../interfaces/app.interface";
import { createSlice } from "@reduxjs/toolkit";

const initialState: IAppMenuState = {
  menu: [],
  navbarCollapsed: true,
  pageTitle: "",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setActiveMenu: (state, action) => {
      state.menu = action.payload;
    },
    setNavbarCollapsed: (state, action) => {
      state.navbarCollapsed = action.payload;
    },
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },
  },
});
export const { setActiveMenu, setNavbarCollapsed, setPageTitle } = appSlice.actions;
export default appSlice.reducer;
