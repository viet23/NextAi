import {
  CloseOutlined,
  DownOutlined,
  LogoutOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Logo from "src/assets/images/next-logo.jpg";
import { Avatar, Drawer as AntdDrawer, Flex, Menu } from "antd";
import type { MenuProps } from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import { Dispatch, SetStateAction } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  setCurrentUser,
  setIsLogin,
  setRefreshToken,
  setToken,
} from "src/store/slice/auth.slice";
import { IMenuItem } from "src/routes/menu-item"; // Giả sử bạn đã khai báo interface IMenuItem

interface IProps {
  menuItemsAuthorize: IMenuItem[];
  openDrawer: boolean;
  setOpenDrawer: Dispatch<SetStateAction<boolean>>;
  defaultSelectedKeys: string[];
  defaultOpenKeys?: string[];
}

// ✅ Hàm chuyển đổi IMenuItem → đúng kiểu MenuProps["items"]
const convertMenuItems = (items: IMenuItem[]): MenuProps["items"] =>
  items.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    children: item.children ? convertMenuItems(item.children) : undefined,
    onClick: item.onClick,
  }));

export const Drawer = ({
  menuItemsAuthorize,
  openDrawer,
  setOpenDrawer,
  defaultSelectedKeys,
  defaultOpenKeys,
}: IProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }: any = useSelector<any>((state) => state.auth);

  const handleClose = () => {
    setOpenDrawer(false);
  };

  const handleClick = (info: MenuInfo) => {
    navigate(info.key, { replace: true });
  };

  const handleLogout = async () => {
    dispatch(setToken(null));
    dispatch(setCurrentUser(null));
    dispatch(setRefreshToken(null));
    dispatch(setIsLogin(false));
    localStorage.clear();
    navigate("/signin", { replace: true });
  };

  return (
    <AntdDrawer
      rootClassName="drawer"
      placement="left"
      title={
        <Link to="/">
          <img style={{ width: 120 }} src={Logo} alt="logo" />
        </Link>
      }
      extra={<CloseOutlined className="close-icon" onClick={handleClose} />}
      open={openDrawer}
      onClose={handleClose}
    >
      <Menu
        mode="inline"
        theme="dark"
        className="nav-list"
        inlineIndent={0}
        inlineCollapsed={false}
        defaultSelectedKeys={defaultSelectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        expandIcon={({ isOpen }) => (isOpen ? <DownOutlined /> : <RightOutlined />)}
        items={convertMenuItems(menuItemsAuthorize)} // ✅ Sử dụng đúng định dạng
        onClick={handleClick}
      />

      <Menu
        mode="inline"
        theme="dark"
        inlineIndent={0}
        inlineCollapsed={false}
        items={[
          {
            key: "/",
            label: (
              <Flex align="center" gap={10}>
                <Avatar size={35} />
                <span className="username">{user?.username}</span>
              </Flex>
            ),
            children: [
              {
                key: "signOut",
                label: (
                  <Flex gap={5}>
                    <LogoutOutlined style={{ fontSize: 19 }} />
                    <span>Sign out</span>
                  </Flex>
                ),
                onClick: handleLogout,
              },
            ],
          },
        ]}
      />
    </AntdDrawer>
  );
};
