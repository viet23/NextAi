import { ReactNode, createElement } from "react";
import { FacebookOutlined, PictureOutlined, UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { DotIcon, } from "src/components/MenuItemIcon";
import { SettingIcon } from "src/components/MenuItemIcon/SettingIcon";
import {
  ACCOUNT_ROUTE,
  CUSTOMER_ROUTE,
  IMAGE_ROUTE,
  AUTHORIZATION_ROUTE,
  TICKET_ROUTE,
  VIDEO_ROUTE,
  FB_ANALYSIS_ROUTE,
} from "src/constants/routes.constants";

import { TicketManageIcon } from "src/components/MenuItemIcon/TicketIcon";


export interface IMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  rolenames?: string[];
  allRoleRequired?: boolean;
  children?: IMenuItem[];
}

// <Menu.Item key="2" icon={<PictureOutlined />}>
//           AI Image generation
//         </Menu.Item>
//         <Menu.Item key="3" icon={<VideoCameraOutlined />}>
//           AI Video generation
//         </Menu.Item>
//         <Menu.Item key="4" icon={<FileTextOutlined />}>
//           Dashboard
//         </Menu.Item>
//       </Menu>

export const menuItems: IMenuItem[] = [
  {
    key: FB_ANALYSIS_ROUTE,
    label: "AI Facebook Analysis ",
    icon: createElement(FacebookOutlined),
  },
  {
    key: IMAGE_ROUTE,
    label: "AI Image generation ",
    icon: createElement(PictureOutlined),
  },
  {
    key: VIDEO_ROUTE,
    label: "AI Video generation ",
    icon: createElement(VideoCameraOutlined),
  },

  {
    key: "customer",
    label: "Khách hàng",
    icon: createElement(UserOutlined, { style: { fontSize: 22 } }),
    children: [
      {
        key: CUSTOMER_ROUTE,
        label: "Khách hàng",
        icon: createElement(DotIcon),
        // rolenames: [GET_BLACK_LIST],
      },
    ],
  },
  {
    key: "ticket",
    label: "Quản lý bài viết",
    icon: createElement(TicketManageIcon),
    // rolenames: [GET_CASE],
    children: [
      {
        key: TICKET_ROUTE,
        label: "Quản lý bài viết",
        icon: createElement(DotIcon),
      },
    ],
  },
  {
    key: "accounts",
    icon: createElement(SettingIcon),
    label: "Tài khoản",
    children: [
      {
        key: ACCOUNT_ROUTE,
        icon: createElement(DotIcon),
        label: "TK người dùng",
        // rolenames: [GET_USER],
      },
      {
        key: AUTHORIZATION_ROUTE,
        icon: createElement(DotIcon),
        label: "Phân quyền",
        // rolenames: [GET_GROUP, GET_ROLE],
        allRoleRequired: true,
      },
    ],
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
