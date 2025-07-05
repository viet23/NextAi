/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { createContext, useContext, useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import { useSelector } from "react-redux";
import { message, Spin } from "antd";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingOutlined } from "@ant-design/icons";
import Logo from "../assets/images/next-logo.jpg";
interface AppContextProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  openDrawer: boolean;
  setIsAppLoading: React.Dispatch<React.SetStateAction<any>>;
  setOpenDrawer: React.Dispatch<React.SetStateAction<any>>;
}
const defaultAppContext: AppContextProps = {
  user: null,
  setUser: () => {},
  setIsAppLoading: () => {},
  openDrawer: false,
  setOpenDrawer: () => {},
};
export const AppContext = createContext(defaultAppContext);
const AppProvider: React.FC<any> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [user, setUser] = useState(null);
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const errors = useSelector((state: any) =>
    Object.values(state?.api.mutations).filter((query: any) => query.status === "rejected")
  );
  const isLoading = useSelector(
    (state: any) =>
      state?.api &&
      (Object.values(state.api.queries || {}).some((query: any) => query?.status === "pending") ||
        Object.values(state.api.mutations || {}).some((query: any) => query?.status === "pending"))
  );
  useEffect(() => {
    if (errors.length > 0) {
      errors.map((item: any) => {
        messageApi.error(item?.error?.data?.meta?.internal_msg);
      });
    }
  }, []);
  return (
    <>
      <AppContext.Provider value={{ user, setUser, openDrawer, setOpenDrawer, setIsAppLoading }}>
        <Backdrop
          sx={{ color: "#fff", zIndex: theme => theme.zIndex.drawer + 1 }}
          open={isLoading || isAppLoading}
        >
          <ToastContainer />
          <div className="wrap-loading">
            <img src={Logo} />
            <Spin indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />} />
          </div>
        </Backdrop>
        {contextHolder}
        {children}
      </AppContext.Provider>
    </>
  );
};
const useAppContext = () => useContext(AppContext);
export { AppProvider, useAppContext };
