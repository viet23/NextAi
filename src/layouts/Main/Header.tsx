import { LogoutOutlined } from "@ant-design/icons";
import { ReactComponent as NavbarIcon } from "src/assets/images/icon/ic-navbar.svg";
import Logo from "src/assets/images/next-logo.jpg";
import { Avatar, Dropdown, Flex, MenuProps } from "antd";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header as AntdHeader } from "antd/es/layout/layout";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { setCurrentUser, setIsLogin, setRefreshToken, setToken } from "src/store/slice/auth.slice";

interface IProps {
  setOpenDrawer: Dispatch<SetStateAction<boolean>>;
}

export const Header = ({ setOpenDrawer }: IProps) => {
  const pageTitle = useSelector((state: IRootState) => state.app.pageTitle);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [signOut] = useLazySignOutQuery();
  const { user }: any = useSelector<any>(state => state.auth.user);
  const handleLogout = useCallback(async () => {
    // await signOut({});

    dispatch(setToken(null));
    dispatch(setCurrentUser(null));
    dispatch(setRefreshToken(null));
    dispatch(setIsLogin(false));
    localStorage.clear();
    navigate("/signin", { replace: true });
  }, [dispatch, navigate]);

  const items: MenuProps["items"] = useMemo(
    () => [
      {
        label: (
          <Flex gap={5} onClick={handleLogout}>
            <LogoutOutlined />
            <span>Sign out</span>
          </Flex>
        ),
        key: "0",
      },
    ],
    [handleLogout]
  );

  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };

  return (
    <AntdHeader className="header">
      <div className="mobile">
        <NavbarIcon fontSize={24} cursor="pointer" onClick={handleOpenDrawer} />

        <Link className="logo-link" to="/">
          <img src={Logo} alt="logo" />
        </Link>
      </div>
      <h2 className="title">{pageTitle}</h2>
      <Dropdown className="dropdown" trigger={["click"]} menu={{ items }}>
        <div className="menu-trigger">
          <Avatar size={34} />
          <span className="username">{user?.username}</span>
        </div>
      </Dropdown>
    </AntdHeader>
  );
};
