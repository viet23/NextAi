import Icon from "@ant-design/icons";
import { GetProps } from "antd";

const MinuteSvg = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 12H6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MinuteIcon = (props: Partial<GetProps<typeof Icon>>) => {
  return <Icon component={MinuteSvg} {...props} />;
};
