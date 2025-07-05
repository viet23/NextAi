import * as React from "react";
import { MenuItemType } from "../../../../routes/menu-item";
interface NavIconProps {
  items: MenuItemType | any;
}
const NavIcon = (props: NavIconProps) => {
  return props.items.icon ? (
    <span className="pcoded-micon">
      <i className={props.items.icon} />
    </span>
  ) : null;
};
export default NavIcon;
