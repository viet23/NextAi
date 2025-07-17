import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardAI from "src/components/Dashboard";
import { PageTitleHOC } from "src/components/PageTitleHOC";
import { Button } from "antd";

const Dashboard = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Bạn có thể thêm logic khi mount nếu cần
  }, []);

  return (
    <PageTitleHOC title={`${t("dashboard.title")}`}>
      <DashboardAI />
    </PageTitleHOC>
  );
};

export default Dashboard;
