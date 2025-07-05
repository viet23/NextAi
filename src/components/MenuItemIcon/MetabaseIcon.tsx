import Icon from "@ant-design/icons";
import { GetProps } from "antd";

const MetabaseSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="2" />
    <path d="M4 6v12c0 1.5 4 3 8 3s8-1.5 8-3V6" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="12" cy="18" rx="8" ry="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const MetabaseIcon = (props: Partial<GetProps<typeof Icon>>) => (
  <Icon component={MetabaseSvg} {...props} />
);
