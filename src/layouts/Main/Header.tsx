import { LogoutOutlined } from "@ant-design/icons";
import { Menu, Layout, Avatar, Dropdown, Flex, Drawer } from "antd";
import { IMenuItem } from "src/routes/menu-item";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Logo from "src/assets/images/next-logo.jpg";
import { ReactComponent as NavbarIcon } from "src/assets/images/icon/ic-navbar.svg";
import { IRootState } from "src/interfaces/app.interface";
import { setCurrentUser, setIsLogin, setRefreshToken, setToken } from "src/store/slice/auth.slice";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

const { Header: AntHeader } = Layout;

interface IProps {
  menuItems: IMenuItem[];
}

export const Header = ({ menuItems }: IProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: IRootState) => state.auth || { user: undefined });
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const { t } = useTranslation();

  const handleLogout = useCallback(() => {
    dispatch(setToken(null));
    dispatch(setCurrentUser(null));
    dispatch(setRefreshToken(null));
    dispatch(setIsLogin(false));
    localStorage.clear();
    navigate("/signin", { replace: true });
  }, [dispatch, navigate]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  const currentFlag = i18n.language === "vi" ? "/VN.png" : "/EN.png";

  const userMenuItems = useMemo(
    () => [
      {
        label: (
          <Flex gap={5} onClick={handleLogout}>
            <LogoutOutlined />
            <span>{t("sign_out") || "Sign out"}</span>
          </Flex>
        ),
        key: "logout",
      },
    ],
    [handleLogout, t]
  );

  return (
    <AntHeader
      className="header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        gap: 24,
        height: 64,
      }}
    >
      {/* Logo và icon navbar nếu là mobile */}
      <div className="left" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isMobile && (
          <NavbarIcon style={{ fontSize: 24, cursor: "pointer" }} onClick={() => setDrawerOpen(true)} />
        )}
        <img src={Logo} alt="logo" style={{ height: 80 }} />
      </div>

      {/* Menu giữa nếu không phải mobile */}
      {!isMobile && (
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ flex: 1, justifyContent: "center" }}
          items={menuItems.map(item => ({
            key: item.key,
            label: item.label,
            onClick: () => navigate(item.key),
          }))}
        />
      )}

      {/* Bên phải: icon cờ + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Nút đổi ngôn ngữ: icon cờ */}
        <img
          onClick={toggleLanguage}
          src={currentFlag}
          alt="flag"
          style={{ width: 28, height: 28, borderRadius: "50%", cursor: "pointer" }}
        />

        {/* Avatar và dropdown */}
        <Dropdown className="dropdown" trigger={["click"]} menu={{ items: userMenuItems }}>
          <div
            className="menu-trigger"
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
            <Avatar size={34} />
            {!isMobile && <span style={{ color: "#fff" }}>{user?.username}</span>}
          </div>
        </Dropdown>
      </div>

      {/* Drawer menu cho mobile */}
      <Drawer
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={250}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          items={menuItems.map(item => ({
            key: item.key,
            label: item.label,
            onClick: () => {
              navigate(item.key);
              setDrawerOpen(false);
            },
          }))}
        />
      </Drawer>
    </AntHeader>
  );
};
