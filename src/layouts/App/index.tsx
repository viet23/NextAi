import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Suspense, useState } from "react";
import NavBar from "../NavBar";
import Navigation from "../Navigation";
const Main = () => {
  const [mainClass, setMainClass] = useState(["content-main"]);
  return (
    <>
      <NavBar />
      <div className={mainClass.join(" ")}>
        <Navigation layoutType="menu-light" />
        <div className="pcoded-main-container full-screenable-node" onClick={() => {}}>
          <div className="pcoded-wrapper">
            <div className="pcoded-content">
              <div className="pcoded-inner-content">
                <div className="main-body">
                  <div className="page-wrapper">
                    <Suspense>
                      <Outlet />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Main;
