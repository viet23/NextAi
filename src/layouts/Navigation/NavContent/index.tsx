import React, { Component } from "react";
import { connect } from "react-redux";
import PerfectScrollbar from "react-perfect-scrollbar";

import NavGroup from "./NavGroup";
interface INavContentProps extends React.HTMLAttributes<Element> {
  layout?: any;
  onNavContentLeave?: any;
  map?: any;
  navigation?: any;
}
type NavContentState = {
  scrollWidth?: number;
  prevDisable?: boolean;
  nextDisable?: boolean;
};
class NavContent extends Component<INavContentProps, NavContentState> {
  state = {
    scrollWidth: 0,
    prevDisable: true,
    nextDisable: false,
  };

  scrollPrevHandler = () => {
    const wrapperWidth = document.getElementById("sidenav-wrapper")?.clientWidth || 0;
    let scrollWidth = this.state.scrollWidth - wrapperWidth;
    if (scrollWidth < 0) {
      this.setState({ scrollWidth: 0, prevDisable: true, nextDisable: false });
    } else {
      this.setState({ scrollWidth: scrollWidth, prevDisable: false });
    }
  };
  scrollNextHandler = () => {
    const wrapperWidth = document.getElementById("sidenav-wrapper")?.clientWidth || 0;
    const contentWidth = document.getElementById("sidenav-horizontal")?.clientWidth || 0;
    let scrollWidth = this.state.scrollWidth + (wrapperWidth - 80);
    if (scrollWidth > contentWidth - wrapperWidth) {
      scrollWidth = contentWidth - wrapperWidth + 80;
      this.setState({
        scrollWidth: scrollWidth,
        prevDisable: false,
        nextDisable: true,
      });
    } else {
      this.setState({ scrollWidth: scrollWidth, prevDisable: false });
    }
  };
  render() {
    const navItems = this.props.navigation.map((item: any) => {
      switch (item.type) {
        case "group":
          return <NavGroup layout={this.props.layout} key={item.id} group={item} />;
        default:
          return false;
      }
    });
    let scrollStyle: { marginLeft?: string; marginRight?: string } = {
      marginRight: "-" + this.state.scrollWidth + "px",
    };
    if (this.props.layout === "horizontal") {
      scrollStyle = {
        marginLeft: "-" + this.state.scrollWidth + "px",
      };
    }
    let mainContent: React.ReactNode = "";
    if (this.props.layout === "horizontal") {
      let prevClass = ["sidenav-horizontal-prev"];
      if (this.state.prevDisable) {
        prevClass = [...prevClass, "disabled"];
      }
      let nextClass = ["sidenav-horizontal-next"];
      if (this.state.nextDisable) {
        nextClass = [...nextClass, "disabled"];
      }
      mainContent = (
        <div className="navbar-content sidenav-horizontal" id="layout-sidenav">
          <a href={"#"} className={prevClass.join(" ")} onClick={this.scrollPrevHandler}>
            <span />
          </a>
          <div id="sidenav-wrapper" className="sidenav-horizontal-wrapper">
            <ul
              id="sidenav-horizontal"
              className="nav pcoded-inner-navbar sidenav-inner"
              onMouseLeave={this.props.onNavContentLeave}
              style={scrollStyle}
            >
              {navItems}
            </ul>
          </div>
          <a href={"#"} className={nextClass.join(" ")} onClick={this.scrollNextHandler}>
            <span />
          </a>
        </div>
      );
    } else {
      mainContent = (
        <div className="navbar-content next-scroll">
          <PerfectScrollbar>
            <ul className="nav pcoded-inner-navbar" id="nav-ps-next">
              {this.props.navigation.map((item: any) => {
                switch (item.type) {
                  case "group":
                    return <NavGroup layout={this.props.layout} key={item.id} group={item} />;
                  default:
                    return false;
                }
              })}
            </ul>
          </PerfectScrollbar>
        </div>
      );
    }
    return <>{mainContent}</>;
  }
}
export default NavContent;
