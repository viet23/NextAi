import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes/routes";
import PrivateRoute from "./components/PrivateRoute";
import { useTranslation } from "react-i18next";
import { ConfigProvider } from "antd";
import ResetPasswordPage from "./pages/resetPassword";

function App() {
  const { i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage("vi");
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
          {/* ✅ Route ĐẶC BIỆT đặt riêng */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ✅ Các route còn lại dùng layout */}
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
