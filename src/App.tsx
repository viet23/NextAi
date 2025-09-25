// src/App.tsx
import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes/routes";
import PrivateRoute from "./components/PrivateRoute";
import { useTranslation } from "react-i18next";
import { ConfigProvider } from "antd";
import ResetPasswordPage from "./pages/resetPassword";

// 👇 import Pixel
import { initFbPixel } from "./lib/fbPixel";

// Pixel ID – nên để ở .env (CRA dùng prefix REACT_APP_)
const PIXEL_ID = process.env.REACT_APP_META_PIXEL_ID || "2596456847365922";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage("vi");
  }, []);

  // Khởi tạo Pixel 1 lần
  useEffect(() => {
    if (PIXEL_ID) {
      initFbPixel(PIXEL_ID);
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Roboto",
          colorPrimary: "#2AA7DF",
        },
      }}
    >
      <Router>
        <Routes>
          {/* Route riêng */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Các route còn lại */}
          {routes.map((group) => (
            <Route key={group.key} element={<group.layout />}>
              {group.routes.map((route) => (
                <Route
                  key={route.key}
                  path={route.path}
                  element={
                    route.isProtect ? (
                      <PrivateRoute>
                        <route.component />
                      </PrivateRoute>
                    ) : (
                      <route.component />
                    )
                  }
                />
              ))}
            </Route>
          ))}
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
