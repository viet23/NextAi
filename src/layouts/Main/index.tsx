import "./Main.scss";
import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Layout, Skeleton } from "antd";
import { Content } from "antd/es/layout/layout";
import { Header } from "./Header";
import { Drawer } from "./Drawer";
import { IMenuItem, menuItems } from "src/routes/menu-item";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAuthRolesQuery } from "src/store/api/authApi";
import { setGroups, setRoles } from "src/store/slice/auth.slice";

export const MainLayout = () => {
  const location = useLocation();

  const dispatch = useDispatch();
  const { isLogin } = useSelector((state: IRootState) => state.auth);

  const { data, isFetching } = useGetAuthRolesQuery({}, { skip: !isLogin });

  const mounted = useRef(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const findOpenKeys = useCallback((item: IMenuItem, target: string) => {
    if (item.key === target) return [item.key];
    if (item.children) {
      const keys = [item.key];
      for (const child of item.children) {
        const childKeys = findOpenKeys(child, target);
        if (childKeys.length) {
          keys.push(...childKeys);
          return keys;
        }
      }
    }

    return [];
  }, []);

  const defaultOpenKeys = useMemo(() => {
    if (mounted.current) return;
    mounted.current = true;
    for (const menuItem of menuItems) {
      const openKeys = findOpenKeys(menuItem, location.pathname);
      if (openKeys.length) {
        return openKeys;
      }
    }
    return [];
  }, [findOpenKeys, location.pathname]);

  const defaultSelectedKeys = useMemo(() => [location.pathname], [
    location.pathname,
  ]);
  const roles = useMemo(() => {
    dispatch(setGroups(data || []))
    return data
      ? Array.from(
          new Map(
            data.flatMap((user) => user.roles).map((role) => [role.id, role])
          ).values()
        )
      : [];
  }, [data]);
  const menuItemsAuthorize = useMemo(() => {
    const getChildrenAuthorize = (item: IMenuItem): IMenuItem | null => {
      if (!item.children) {
        const { allRoleRequired: _allRoleRequired, ...otherProps } = item; // remove warning allRoleRequired props must be allrolerequired
        const operator = item.allRoleRequired ? "every" : "some";
        return !item.rolenames ||
          item.rolenames?.[operator]((roleName) =>
          roles.find((x) => x.name === roleName)
          )
          ? otherProps
          : null;
      }

      const children: IMenuItem[] = [];
      for (let i = 0; i < item.children.length; i++) {
        if (getChildrenAuthorize(item.children[i]))
          children.push(getChildrenAuthorize(item.children[i])!);
      }

      return children.length ? { ...item, children } : null;
    };

    return menuItems.reduce<IMenuItem[]>((acc, item) => {
      const menuItem = getChildrenAuthorize(item);
      if (menuItem) {
        return [...acc, menuItem];
      }

      return acc;
    }, []);
  }, [data]);

  useLayoutEffect(() => {
    if (isLogin && data) {
      dispatch(setRoles(roles));
    }
  }, [isLogin, data, dispatch]);

  return (
    <Layout>
      <Sidebar
        menuItemsAuthorize={menuItemsAuthorize}
        isFetching={isFetching}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        defaultSelectedKeys={defaultSelectedKeys}
        defaultOpenKeys={defaultOpenKeys}
      />
      <Drawer
        menuItemsAuthorize={menuItemsAuthorize}
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        defaultSelectedKeys={defaultSelectedKeys}
        defaultOpenKeys={defaultOpenKeys}
      />
      <Layout className={`main ${collapsed ? "main-collapsed" : ""}`}>
        <Header setOpenDrawer={setOpenDrawer} />
        <Content className="content">
          <Suspense fallback={<Skeleton />}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};
