import * as React from "react";

import NavCollapse from "./../NavCollapse";
import NavItem from "./../NavItem";
import { MenuItemType } from "../../../../routes/menu-item";
interface NavGroupProps {
  group: MenuItemType;
  layout: string;
}
const navGroup = (props: NavGroupProps) => {
  let navItems: React.ReactNode = "";
  if (props.group.children) {
    const groups = props.group.children;
    navItems = Object.keys(groups).map(key => {
      const item = groups[parseInt(key)];
      switch (item.type) {
        case "collapse":
          return <NavCollapse key={item.id} collapse={item} type="main" />;
        case "item":
          return <NavItem layout={props.layout} key={item.id} item={item} />;
        default:
          return false;
      }
    });
  }
  return (
    <>
      <li key={props.group.id} className="nav-item pcoded-menu-caption">
        <label>{props.group.title}</label>
      </li>
      {navItems}
    </>
  );
};
export default navGroup;
