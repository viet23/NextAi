import "./Main.scss";
import { Suspense, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Layout, Skeleton } from "antd";
import { Content } from "antd/es/layout/layout";
import { Header } from "./Header";
import { IMenuItem, getMenuItems } from "src/routes/menu-item";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { useGetAuthRolesQuery } from "src/store/api/authApi";
import { setGroups, setRoles } from "src/store/slice/auth.slice";
import { useTranslation } from "react-i18next";

export const MainLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLogin } = useSelector((state: IRootState) => state.auth);

  const { data } = useGetAuthRolesQuery({}, { skip: !isLogin });

  const mounted = useRef(false);
  const menuItems = useMemo(() => getMenuItems(t), [t]);

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

  const defaultSelectedKeys = useMemo(() => [location.pathname], [location.pathname]);

  const roles = useMemo(() => {
    dispatch(setGroups(data || []));
    return data
      ? Array.from(new Map(data.flatMap(user => user.roles).map(role => [role.id, role])).values())
      : [];
  }, [data]);

  const menuItemsAuthorize = useMemo(() => {
    const getChildrenAuthorize = (item: IMenuItem): IMenuItem | null => {
      if (!item.children) {
        const { allRoleRequired: _allRoleRequired, ...otherProps } = item;
        const operator = item.allRoleRequired ? "every" : "some";
        return !item.rolenames ||
          item.rolenames?.[operator](roleName => roles.find(x => x.name === roleName))
          ? otherProps
          : null;
      }

      const children: IMenuItem[] = [];
      for (let i = 0; i < item.children.length; i++) {
        const childAuthorized = getChildrenAuthorize(item.children[i]);
        if (childAuthorized) children.push(childAuthorized);
      }

      return children.length ? { ...item, children } : null;
    };

    return menuItems.reduce<IMenuItem[]>((acc: IMenuItem[], item: IMenuItem) => {
      const menuItem = getChildrenAuthorize(item);
      if (menuItem) {
        return [...acc, menuItem];
      }
      return acc;
    }, []);
  }, [data, roles, menuItems]);

  useLayoutEffect(() => {
    if (isLogin && data) {
      dispatch(setRoles(roles));
    }
  }, [isLogin, data, dispatch, roles]);

  return (
    <Layout>
      <Layout className="main">
        <Header menuItems={menuItemsAuthorize} />
        {/* <Content className="content"> */}
          <Suspense fallback={<Skeleton />}>
            <Outlet />
          </Suspense>
        {/* </Content> */}
      </Layout>
    </Layout>
  );
};
