import Icon from "@ant-design/icons";
import { GetProps } from "antd";

const DotSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const DotIcon = (props: Partial<GetProps<typeof Icon>>) => (
  <Icon component={DotSvg} {...props} />
);
