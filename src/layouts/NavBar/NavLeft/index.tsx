import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import NavSearch from "./NavSearch";
class NavLeft extends Component<{}, {}> {
  render() {
    return (
      <>
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <NavSearch />
          </li>
        </ul>
      </>
    );
  }
}
export default NavLeft
// export default windowSize(NavLeft as any);
