import React, { Component, useEffect, useState } from "react";
import NavIcon from "./../NavIcon";
import NavBadge from "./../NavBadge";
import NavItem from "../NavItem";
import { MenuItemType } from "../../../../routes/menu-item";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../../../interfaces/app.interface";
import { setActiveMenu } from "../../../../store/slice/app.slice";

interface INavCollapseProps extends React.HTMLAttributes<Element> {
  isOpen?: any;
  isTrigger?: any;
  layout?: any;
  type?: string;
  id?: any;
  collapse?: MenuItemType;
  onCollapseToggle?: any;
  onNavCollapseLeave?: any;
  icon?: any;
  title?: any;
}
const NavCollapse: React.FC<INavCollapseProps> = props => {
  const { isOpen, isTrigger } = props;
  const [navLinkClass, setNavLinkClass] = useState(["nav-link "]);
  const [navItemClass, setNavItemClass] = useState(["nav-item", "pcoded-hasmenu"]);
  const dispatch = useDispatch();
  const { menu } = useSelector((state: IRootState) => state.app);
  const onCollapseToggle = (id: string | any, type: any) => {
    if (!menu.includes(id)) {
      dispatch(setActiveMenu([...menu, id]));
    } else {
      dispatch(setActiveMenu(menu.filter((key: string) => key != id)));
    }
  };
  useEffect(() => {}, []);

  const itemTitle = () => {
    if (props.collapse?.icon) {
      return <span className="pcoded-mtext">{props.collapse?.title}</span>;
    }
    return props.collapse?.title;
  };

  const navItems = () => {
    if (props.collapse?.children) {
      const collapses = props.collapse.children;
      return Object.keys(collapses).map(key => {
        const item = collapses[parseInt(key)];
        switch (item.type) {
          case "collapse":
            return <NavCollapse key={item.id} collapse={item} type="sub" />;
          case "item":
            return <NavItem layout={props.layout} key={item.id} item={item} />;
          default:
            return false;
        }
      });
    }
    return "";
  };

  return props.layout ? (
    <li
      className={
        props && menu.includes(props?.collapse?.id)
          ? `${navItemClass.join(" ")}`
          : navItemClass.join(" ")
      }
      onMouseLeave={() => props.onNavCollapseLeave(props.collapse?.id, props.type)}
      onMouseEnter={() => onCollapseToggle(props.collapse?.id, props.type)}
    >
      <>
        <a
          href={"#"}
          className={navLinkClass.join(" ")}
          onClick={() => onCollapseToggle(props.collapse?.id, props.type)}
        >
          <NavIcon items={props.collapse} />
          {itemTitle()}
          <NavBadge layout={props.layout} items={props.collapse} />
        </a>
        <ul className="pcoded-submenu">{navItems()}</ul>
      </>
    </li>
  ) : (
    <li
      className={
        props && menu.includes(props?.collapse?.id)
          ? `${navItemClass.join(" ")} pcoded-trigger active`
          : navItemClass.join(" ")
      }
    >
      <>
        <a
          href={"#"}
          className={
            props && menu.includes(props?.collapse?.id)
              ? `${navLinkClass.join(" ")} active`
              : navLinkClass.join(" ")
          }
          onClick={() => onCollapseToggle(props.collapse?.id, props.type)}
        >
          <NavIcon items={props.collapse} />
          {itemTitle()}
          <NavBadge layout={props.layout} items={props.collapse} />
        </a>
        <ul className="pcoded-submenu">{navItems()}</ul>
      </>
    </li>
  );
};
export default NavCollapse;
