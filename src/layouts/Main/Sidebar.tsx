// Sidebar.tsx
import Logo from "src/assets/images/next-logo.jpg";
import { ReactComponent as NavbarIcon } from "src/assets/images/icon/ic-navbar.svg"; 
import { Flex, Menu } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import { Link, useNavigate } from "react-router-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import Sider from "antd/es/layout/Sider";
import { IMenuItem } from "src/routes/menu-item";
import { DownOutlined, RightOutlined } from "@ant-design/icons";

interface IProps {
  menuItemsAuthorize: IMenuItem[];
  isFetching: boolean;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  defaultSelectedKeys: string[];
  defaultOpenKeys?: string[];
}

export const Sidebar = ({
  menuItemsAuthorize,
  isFetching,
  collapsed,
  setCollapsed,
  defaultSelectedKeys,
  defaultOpenKeys,
}: IProps) => {
  const navigate = useNavigate();

  const handleClick = (info: MenuInfo) => {
    navigate(info.key, { replace: true });
  };

  const handleToggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [setCollapsed]);

  return (
    <>
      {!collapsed && (
        <div className="sidebar-overlay" onClick={handleToggleCollapsed} />
      )}
      <Sider
        className="sider"
        width="17.5rem"
        collapsed={collapsed}
        collapsedWidth="0"
      ><Flex justify="space-between" align="center" className="head">
          {!collapsed && (
            <div
              onClick={handleToggleCollapsed}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              <img className="logo" src={Logo} alt="logo" />
            </div>
          )}
          <NavbarIcon
            style={{ color: '#1a73e8', width: 24, height: 24 }}
            onClick={handleToggleCollapsed}
          />
        </Flex>

        {!isFetching && (
          <Menu
            defaultSelectedKeys={defaultSelectedKeys}
            defaultOpenKeys={defaultOpenKeys}
            className={`nav-list ${collapsed ? "collapsed" : ""}`}
            rootClassName="nav-submenu-popup"
            mode="inline"
            theme="light"
            style={{ backgroundColor: '#ffffff' }}
            expandIcon={({ isOpen }) =>
              isOpen ? <DownOutlined /> : <RightOutlined />
            }
            inlineIndent={0}
            items={menuItemsAuthorize}
            onClick={handleClick}
          />
        )}
      </Sider>
    </>
  );
};


