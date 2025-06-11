import React from "react";
import AuthenLayout from "../layouts/Authen";
import SignIn from "../pages/SignIn";
import { MainLayout } from "../layouts/Main";
import Customers from "../pages/Customers";
import Users from "../pages/Users";
import {
  ACCOUNT_DETAIL_ROUTE,
  ACCOUNT_ROUTE,
  AUTHORIZATION_ROUTE,
  CUSTOMER_ROUTE,
  FB_ANALYSIS_ROUTE,
  IMAGE_ROUTE,
  ROLE_GROUPS_CREATE_ROUTE,
  MEDIA_ROUTE,
  USER_ROUTE,
  VIDEO_ROUTE,
  DASHBOARD_ROUTE,
} from "src/constants/routes.constants";
import MediaList from "src/pages/MediaList";
import Dashboard from "src/pages/Dashboard";
const AccountDetailPage = React.lazy(() => import("src/pages/AccountDetail"));
const AccountsPage = React.lazy(() => import("src/pages/Accounts"));
const AuthorizationsPage = React.lazy(() => import("src/pages/Authorizations"));
const RoleGroupCreatePage = React.lazy(
  () => import("src/pages/RoleGroupCreate")
);
const FacebookAnalysis = React.lazy(() => import("../pages/FacebookAnalysis"));
const ImageAI = React.lazy(() => import("../pages/ImageAI"));
const Video = React.lazy(() => import("../pages/VideoAI"));
export const routes = [
  {
    key: "unauthen",
    layout: AuthenLayout,
    routes: [
      {
        path: "/signin",
        name: "SignIn",
        key: "signin",
        isProtect: false,
        component: SignIn,
      },
    ],
  },
  {
    key: "main",
    layout: MainLayout,
    routes: [
      {
        path: FB_ANALYSIS_ROUTE,
        isProtect: true,
        key: "facebookAnalysis",
        name: "FacebookAnalysis",
        component: FacebookAnalysis,
      },
      {
        path: IMAGE_ROUTE,
        isProtect: true,
        key: "imageAI",
        name: "ImageAI",
        component: ImageAI,
      },
      {
        path: VIDEO_ROUTE,
        isProtect: true,
        key: "video",
        name: "Video",
        component: Video,
      },

      {
        path: CUSTOMER_ROUTE,
        isProtect: true,
        key: "quan-ly-khach-hang",
        name: "Customers",
        component: Customers,
      },
      {
        path: MEDIA_ROUTE,
        isProtect: true,
        key: "mediaList",
        name: "MediaList",
        component: MediaList,
      },
       {
        path: DASHBOARD_ROUTE,
        isProtect: true,
        key: "dashboard",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: USER_ROUTE,
        isProtect: true,
        key: "users",
        name: "Users",
        component: Users,
      },
      {
        path: ACCOUNT_ROUTE,
        isProtect: true,
        key: "accounts",
        name: "accounts",
        component: AccountsPage,
      },
      {
        path: ACCOUNT_DETAIL_ROUTE,
        isProtect: true,
        key: "accountDetail",
        name: "accountDetail",
        component: AccountDetailPage,
      },
      {
        path: AUTHORIZATION_ROUTE,
        isProtect: true,
        key: "authorizations",
        name: "authorizations",
        component: AuthorizationsPage,
      },
      {
        path: ROLE_GROUPS_CREATE_ROUTE,
        isProtect: true,
        key: "roleGroupCreate",
        name: "roleGroupCreate",
        component: RoleGroupCreatePage,
      },
    ],
  },
];
