import { ReactNode, createElement } from "react";
import { FacebookOutlined, PictureOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { DotIcon } from "src/components/MenuItemIcon";
import { SettingIcon } from "src/components/MenuItemIcon/SettingIcon";
import {
  ACCOUNT_ROUTE,
  IMAGE_ROUTE,
  AUTHORIZATION_ROUTE,
  MEDIA_ROUTE,
  VIDEO_ROUTE,
  FB_ANALYSIS_ROUTE,
  DASHBOARD_ROUTE,
  CREDITS_ROUTE,
  HOME_INTEL_ROUTE,
} from "src/constants/routes.constants";

import { TicketManageIcon } from "src/components/MenuItemIcon/TicketIcon";
import { GET_BLACK_LIST, GET_GROUP, GET_ROLE, GET_USER } from "src/constants/roles.constants";
import { TFunction } from "i18next";
import HomeIntel from "src/pages/HomeIntel";

export interface IMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  rolenames?: string[];
  allRoleRequired?: boolean;
  children?: IMenuItem[];
  onClick?: () => void;
}

export const getMenuItems = (t: TFunction): IMenuItem[] => [
  {
    key: HOME_INTEL_ROUTE,
    label: t("menu.home"),
    icon: createElement(HomeIntel),
  },
  {
    key: FB_ANALYSIS_ROUTE,
    label: t("menu.facebook_analysis"),
    icon: createElement(FacebookOutlined),
  },
  {
    key: IMAGE_ROUTE,
    label: t("menu.image_generation"),
    icon: createElement(PictureOutlined),
  },
  {
    key: VIDEO_ROUTE,
    label: t("menu.video_generation"),
    icon: createElement(VideoCameraOutlined),
  },
  {
    key: MEDIA_ROUTE,
    label: t("menu.media_list"),
    icon: createElement(TicketManageIcon),
  },
  {
    key: DASHBOARD_ROUTE,
    label: t("menu.ads_dashboard"),
    icon: createElement(TicketManageIcon),
  },
  {
    key: ACCOUNT_ROUTE,
    icon: createElement(DotIcon),
    label: t("menu.user_account"),
    rolenames: [GET_USER],
  },
  {
    key: CREDITS_ROUTE,
    icon: createElement(DotIcon),
    label: t("accounts.credits"),
    // rolenames: [GET_USER],
  },


  {
    key: AUTHORIZATION_ROUTE,
    icon: createElement(DotIcon),
    label: t("menu.user_authorization"),
    rolenames: [GET_GROUP, GET_ROLE],
    allRoleRequired: true,
  },
];

interface Badge {
  title: string;
  type: string;
}
export interface MenuItemType {
  id: string;
  title: string;
  type: string;
  icon?: string;
  children?: MenuItemType[];
  breadcrumbs?: boolean;
  url?: string;
  badge?: Badge;
  target?: boolean;
  classes?: string;
  external?: boolean;
}
const chartData: { items: MenuItemType[] } = {
  items: [
    {
      id: "dashboard",
      title: "Thông tin chung",
      type: "group",
      icon: "feather icon-monitor",
      children: [
        {
          id: "dashboard-merchant",
          title: "Thông tin chung",
          type: "item",
          url: "/",
          icon: "feather icon-server",
        },
      ],
    },
    {
      id: "customers",
      title: "Khách hàng",
      type: "group",
      icon: "icon-navigation",
      children: [
        {
          id: "uses",
          title: "Khách hàng",
          type: "item",
          icon: "feather icon-users",
          url: "/quan-ly-khach-hang",
        },
        {
          id: "black-list",
          title: "DS Đen",
          type: "item",
          icon: "feather icon-layers",
          url: "/quan-ly-truy-tim-truy-na",
        },
      ],
    },
    {
      id: "reports",
      title: "Báo cáo",
      type: "group",
      icon: "icon-navigation",
      children: [
        {
          id: "userGrowthReports",
          title: "Báo cáo tăng trưởng user",
          type: "item",
          icon: "feather icon-bar-chart-2",
          url: "/bao-cao-tang-truong-nguoi-dung",
        },
        {
          id: "financialTransactionReports",
          title: "Báo cáo giao dịch tài chính",
          type: "item",
          icon: "feather icon-bar-chart-2",
          url: "/bao-cao-giao-dich-tai-chinh",
        },
      ],
    },
  ],
};
export default chartData;
