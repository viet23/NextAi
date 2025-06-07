/* eslint-disable react-hooks/exhaustive-deps */
import React, { Component, useEffect, useState } from "react";
import NavContent from "./NavContent";
import OutsideClick from "./OutsideClick";

import navigation from "../../routes/menu-item";
import { useSelector } from "react-redux";
import { IRootState } from "../../interfaces/app.interface";
interface INavigationProps extends React.HTMLAttributes<Element> {
  windowWidth?: any;
  fullWidthLayout?: any;
  collapseMenu?: any;
  layout?: any;
  navFixedLayout?: any;
  headerFixedLayout?: any;
  onChangeLayout?: any;
  layoutType: string;
}
const Navigation:React.FC<INavigationProps> = (props) =>{
  const {navbarCollapsed} = useSelector((state: IRootState) => state.app)
  const scroll = () => {
   
  };
  const [navClass, setNavClass] = useState<string[]>(["pcoded-navbar ", "x"])
  const [navBarClass, setNavBarClass] = useState(["navbar-wrapper", "content-main"])
  useEffect(() => {
    if(navbarCollapsed){
      setNavClass([...navClass, 'navbar-collapsed'])
    }else{
      setNavClass((prev) => {
        return prev.filter((i) => i != 'navbar-collapsed')
      })
    }
  }, [navbarCollapsed])
  
  useEffect(() => {
    setNavClass( [...navClass, props.layoutType])
    if (props.layout === "horizontal") {
      setNavClass([...navClass, "theme-horizontal"]);
    } else {
      if (props.navFixedLayout) {
        setNavClass([...navClass, "menupos-fixed"]);
      }
      if (props.navFixedLayout && !props.headerFixedLayout) {
        window.addEventListener("scroll", scroll, true);
        window.scrollTo(0, 0);
      } else {
        window.removeEventListener("scroll", scroll, false);
      }
    }
  }, [props.layoutType, props.layout])
  useEffect(() => {
    if (props.fullWidthLayout) {
      setNavBarClass([...navBarClass, "container-fluid"]);
    } else {
      setNavBarClass([...navBarClass, "container"]);
    }
  }, [props.fullWidthLayout])
  const navContent = () => {
    return props.windowWidth < 992 ? (
      <OutsideClick>
        <div className="navbar-wrapper">
          <NavContent navigation={navigation.items} />
        </div>
      </OutsideClick>
    ) :  (
      <div className={navBarClass.join(" ")}>
        <NavContent navigation={navigation.items} />
      </div>
    )
  }
  return (
    <>
      <nav className={navClass.join(" ")}>{navContent()}</nav>
    </>
  );
}
export default Navigation