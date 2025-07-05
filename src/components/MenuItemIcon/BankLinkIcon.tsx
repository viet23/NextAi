import Icon from "@ant-design/icons";
import { GetProps } from "antd";

const BankLinkSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
    <path
      d="M9 12H7C5.34 12 4 10.66 4 9C4 7.34 5.34 6 7 6H9M15 12H17C18.66 12 20 10.66 20 9C20 7.34 18.66 6 17 6H15M9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12M9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BankLinkIcon = (props: Partial<GetProps<typeof Icon>>) => (
  <Icon component={BankLinkSvg} {...props} />
);
