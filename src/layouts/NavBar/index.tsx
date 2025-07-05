/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from "react";
import logo from "../../assets/images/next-logo.jpg";
import NavRight from "./NavRight";
import NavLeft from "./NavLeft";
import { useAppContext } from "../../context/AppContext";
import { setNavbarCollapsed } from "../../store/slice/app.slice";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../interfaces/app.interface";
import Link from "antd/es/typography/Link";
const NavBar = () => {
  const dispatch = useDispatch();
  const { navbarCollapsed } = useSelector((state: IRootState) => state.app);
  const [headerClass, setHeaderClass] = useState(["navbar", "pcoded-header", "navbar-expand-lg"]);
  const { openDrawer } = useAppContext();
  const [fullWidthLayout, setFullWidthLayout] = useState(true);
  const [mainHeaderClass, setMainHeaderClass] = useState(["content-main"]);
  const [toggleClass, setToggleClass] = useState(["mobile-menu"]);
  useEffect(() => {
    if (fullWidthLayout) {
      setMainHeaderClass([...mainHeaderClass, "container-fluid"]);
    } else {
      setMainHeaderClass([...mainHeaderClass, "container"]);
    }
    if (true) {
      setToggleClass([...toggleClass, "on"]);
    }
  }, []);
  useEffect(() => {
    if (openDrawer) {
      if (!headerClass.includes("header-open-drawer")) {
        setHeaderClass([...headerClass, "header-open-drawer"]);
      }
    } else {
      setHeaderClass(prev => prev.filter(i => i !== "header-open-drawer"));
    }
  }, [openDrawer]);
  return (
    <header className={headerClass.join(" ")}>
      <div className={mainHeaderClass.join(" ")}>
        <div className="m-header">
          <Link
            className={toggleClass.join(" ")}
            id="mobile-collapse1"
            onClick={() => {
              dispatch(setNavbarCollapsed(!navbarCollapsed));
            }}
          >
            <span />
          </Link>
          <a href={"#"} className="b-brand">
            <img id="main-logo" src={logo} alt="" width={120} className="logo" />
          </a>
        </div>
        <Link
          className="mobile-menu"
          onClick={() => {
            // alert()
            // dispatch(setNavbarCollapsed(!navbarCollapsed));
          }}
          id="mobile-header"
        >
          <i className="feather icon-more-horizontal" />
        </Link>
        <div className="collapse navbar-collapse">
          <NavLeft />
          <NavRight />
        </div>
      </div>
    </header>
  );
};
export default NavBar;
