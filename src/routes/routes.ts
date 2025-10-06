import React from "react";
import AuthenLayout from "../layouts/Authen";
import HomeLayout from "../layouts/Home";
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
  CREDITS_ROUTE,
  HOME_INTEL_ROUTE,
  ACCOUNT_DETAIL_USER_ROUTE,
  AI_ADS_ROUTE,
  ACCOUNT_HYSTORY_ROUTE
} from "src/constants/routes.constants";
import MediaList from "src/pages/MediaList";
import Dashboard from "src/pages/Dashboard";
import RegisterForm from "src/pages/Register";
import RegisterPage from "src/pages/Register";
import MediaTreanding from "src/pages/MediaTreanding";
import ForgotPasswordPage from "src/pages/ForgotPassword";
import ResetPasswordPage from "src/pages/resetPassword";
import PolicyPage from "src/pages/PolicyPage";
import CampaignReportss from "src/pages/CampaignReport";
import PrivacyPolicy from "src/pages/PrivacyPolicy";
import CampaignHistory from "src/components/CampaignHistory";
const HomeIntel = React.lazy(() => import("src/pages/HomeIntel"));
const CreditsPage = React.lazy(() => import("src/pages/Credits"));
const AccountDetailPage = React.lazy(() => import("src/pages/AccountDetail"));
const AccountDetailUserPage = React.lazy(() => import("src/pages/AccountDetailUser"));

const AccountsPage = React.lazy(() => import("src/pages/Accounts"));
const AuthorizationsPage = React.lazy(() => import("src/pages/Authorizations"));
const RoleGroupCreatePage = React.lazy(() => import("src/pages/RoleGroupCreate"));
const FacebookAnalysis = React.lazy(() => import("../pages/FacebookAnalysis"));
const Home = React.lazy(() => import("../pages/Home"));
const ImageAI = React.lazy(() => import("../pages/ImageAI"));
const Video = React.lazy(() => import("../pages/VideoAI"));
export const routes = [
  {
    key: "authen",
    layout: AuthenLayout,
    routes: [
      {
        path: "/signin",
        name: "SignIn",
        key: "signin",
        isProtect: false,
        component: SignIn,
      },
      {
        path: "/register",
        name: "Register",
        key: "register",
        isProtect: false,
        component: RegisterPage,
      },
      {
        path: "/forgot",
        name: "Forgot",
        key: "forgot",
        isProtect: false,
        component: ForgotPasswordPage,
      },
    ],
  },

  {
    key: "home",
    layout: HomeLayout,
    routes: [
      {
        path: "/home",
        isProtect: false,
        key: "home",
        name: "home",
        component: Home,
      },
      {
        path: "/policy-page",
        isProtect: false,
        key: "home",
        name: "home",
        component: PolicyPage,
      },
      {
        path: "/privacy-policy",
        isProtect: false,
        key: "privacy",
        name: "privacy",
        component: PrivacyPolicy,
      },
    ],
  },

  {
    key: "main",
    layout: MainLayout,
    routes: [


      {
        path: HOME_INTEL_ROUTE,
        isProtect: true,
        key: "homeIntel",
        name: "homeIntel",
        component: HomeIntel,
      },

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
        component: MediaTreanding,
      },
      // {
      //   path: MEDIA_ROUTE,
      //   isProtect: true,
      //   key: "mediaList",
      //   name: "MediaList",
      //   component: MediaList,
      // },
      {
        path: DASHBOARD_ROUTE,
        isProtect: true,
        key: "dashboard",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: AI_ADS_ROUTE,
        isProtect: true,
        key: "aiAdsReport",
        name: "aiAdsReport",
        component: CampaignReportss,
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
        path: ACCOUNT_HYSTORY_ROUTE,
        isProtect: true,
        key: "history",
        name: "history",
        component: CampaignHistory,
      },
      {
        path: ACCOUNT_DETAIL_USER_ROUTE,
        isProtect: true,
        key: "accountDetail",
        name: "accountDetail",
        component: AccountDetailUserPage,
      },
      {
        path: CREDITS_ROUTE,
        isProtect: true,
        key: "credits",
        name: "credits",
        component: CreditsPage,
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
