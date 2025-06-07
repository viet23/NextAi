import React, { Component } from "react";
import { connect } from 'react-redux';
import { NavLink } from "react-router-dom";

import NavIcon from "./../NavIcon";
import NavBadge from "./../NavBadge";
interface INavItemProps extends React.HTMLAttributes<Element> {
  layout?: any;
  windowWidth?: any;
  classes?: any;
  item?: any;
  onItemClick?: any;
  onItemLeave?: any;
  external?: any;
  url?: any;
  target?: any;
  icon?: any;
  title?: any;
}
class NavItem extends Component<INavItemProps, {}> {
  render() {
    let itemTitle = this.props.item.title;
    if (this.props.item.icon) {
      itemTitle = <span className="pcoded-mtext">{this.props.item.title}</span>;
    }
    let itemTarget = "";
    if (this.props.item.target) {
      itemTarget = "_blank";
    }
    let subContent;
    if (this.props.item.external) {
      subContent = (
        <a href={this.props.item.url} target="_blank" rel="noopener noreferrer">
          <NavIcon items={this.props.item} />
          {itemTitle}
          <NavBadge layout={this.props.layout} items={this.props.item} />
        </a>
      );
    } else {
      subContent = (
        <NavLink
          to={this.props.item.url}
          className="nav-link"
          target={itemTarget}
        >
          <NavIcon items={this.props.item} />
          {itemTitle}
          <NavBadge layout={this.props.layout} items={this.props.item} />
        </NavLink>
      );
    }
    let mainContent: React.ReactNode = "";
    if (this.props.layout === "horizontal") {
      mainContent = <li onClick={this.props.onItemLeave}>{subContent}</li>;
    } else {
      if (this.props.windowWidth < 992) {
        mainContent = (
          <li
            className={this.props.item.classes}
            onClick={this.props.onItemClick}
          >
            {subContent}
          </li>
        );
      } else {
        mainContent = <li className={this.props.item.classes}>{subContent}</li>;
      }
    }
    return <>{mainContent}</>;
  }
}
export default NavItem

