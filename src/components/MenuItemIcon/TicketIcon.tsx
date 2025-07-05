import Icon from "@ant-design/icons";
import { GetProps } from "antd";

const TicketManageSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 12A2 2 0 108 8A2 2 0 008 12Z" fill="currentColor" />
    <path
      d="M14 13L16 14L15.5 12L17 11H15L14 9L13 11H11L12.5 12L12 14L14 13Z"
      fill="currentColor"
    />
  </svg>
);

export const TicketManageIcon = (props: Partial<GetProps<typeof Icon>>) => (
  <Icon component={TicketManageSvg} {...props} />
);
