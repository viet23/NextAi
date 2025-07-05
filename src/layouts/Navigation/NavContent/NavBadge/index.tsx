import * as React from "react";
import { MenuItemType } from "../../../../routes/menu-item";
interface NavBadgeProps {
  items: any;
  layout?: string;
}
const NavBadge = (props: NavBadgeProps) => {
  return props.items.badge ? (
    <span className={["label", "pcoded-badge", props.items.badge.type].join(" ")}>
      {props.items.badge.title}
    </span>
  ) : null;
};
export default NavBadge;
