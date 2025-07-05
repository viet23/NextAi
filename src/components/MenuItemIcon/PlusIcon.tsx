import Icon from "@ant-design/icons";
import { GetProps } from "antd";

const PlusSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 6V12M12 12V18M12 12H18M12 12L6 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlusIcon = (props: Partial<GetProps<typeof Icon>>) => (
  <Icon component={PlusSvg} {...props} />
);
