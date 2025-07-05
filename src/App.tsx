import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { routes } from "./routes/routes";
import PrivateRoute from "./components/PrivateRoute";
import { useTranslation } from "react-i18next";
import { ConfigProvider } from "antd";
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
          {routes.map(item => {
            if (!!item) {
              return (
                <Route element={<item.layout />} path="/" key={item.key}>
                  {item.routes.map(i => {
                    return (
                      <Route
                        index={i.path == "/" || false}
                        element={
                          i.isProtect ? (
                            <PrivateRoute>
                              <i.component />
                            </PrivateRoute>
                          ) : (
                            <>
                              <i.component />
                            </>
                          )
                        }
                        path={i.path}
                        key={i.key}
                      />
                    );
                  })}
                </Route>
              );
            }
          })}
          {/* <Route path="*" element={<SignIn />} /> */}
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
