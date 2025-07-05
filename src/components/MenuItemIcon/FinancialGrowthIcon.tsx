import Icon from "@ant-design/icons";
import { GetProps } from "antd";

const FinancialGrowthSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M6 16L10 12L14 14L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 8H18V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FinancialGrowthIcon = (props: Partial<GetProps<typeof Icon>>) => (
  <Icon component={FinancialGrowthSvg} {...props} />
);
