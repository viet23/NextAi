import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardAI from "src/components/Dashboard";
import { PageTitleHOC } from "src/components/PageTitleHOC";

const Dashboard = () => {
  const { t } = useTranslation();
  useEffect(() => {}, []);
  return (
    <PageTitleHOC title=" ALL ONE ADS ">
      <DashboardAI />
    </PageTitleHOC>
  );
};
export default Dashboard;

