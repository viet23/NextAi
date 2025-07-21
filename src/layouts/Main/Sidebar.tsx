// Sidebar.tsx
import Logo from "src/assets/images/next-logo.jpg";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Flex, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MenuInfo } from "rc-menu/lib/interface";
import type { MenuProps } from "antd";
import { IMenuItem } from "src/routes/menu-item";

interface IProps {
  menuItemsAuthorize: IMenuItem[];
  isFetching: boolean;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  defaultSelectedKeys: string[];
  defaultOpenKeys?: string[];
}

// ✅ Hàm convert từ IMenuItem sang Ant Design Menu Item chuẩn
const convertMenuItems = (items: IMenuItem[]): MenuProps["items"] =>
  items.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    onClick: item.onClick,
    children: item.children ? convertMenuItems(item.children) : undefined,
  }));

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
      {!collapsed && <div className="sidebar-overlay" onClick={handleToggleCollapsed} />}
      <Sider className="sider" width="17.5rem" collapsed={collapsed} collapsedWidth="0">
        <Flex justify="space-between" align="center" className="head">
          {!collapsed && (
            <div
              onClick={handleToggleCollapsed}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              <img className="logo" src={Logo} alt="logo" />
            </div>
          )}
        </Flex>

        {!isFetching && (
          <Menu
            defaultSelectedKeys={defaultSelectedKeys}
            defaultOpenKeys={defaultOpenKeys}
            className={`nav-list ${collapsed ? "collapsed" : ""}`}
            rootClassName="nav-submenu-popup"
            mode="inline"
            theme="light"
            style={{ backgroundColor: "#ffffff" }}
            expandIcon={({ isOpen }) => (isOpen ? <DownOutlined /> : <RightOutlined />)}
            inlineIndent={0}
            items={convertMenuItems(menuItemsAuthorize)} // ✅ Sửa lỗi TS2322 tại đây
            onClick={handleClick}
          />
        )}
      </Sider>
    </>
  );
};
