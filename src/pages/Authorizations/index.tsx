import "./Authorizations.scss";
import { Button, Card, Col, Row, message } from "antd";
import { AuthorizationsGroupRoles } from "./AuthorizationsGroupRoles";
import { useCallback, useEffect, useState } from "react";
import { AuthorizationsRolesTable } from "./AuthorizationsRolesTable";
import {
  useCreateOrUpdateRoleGroupMutation,
  useGetRoleGroupDetailQuery,
  useGetRoleGroupsQuery,
  useGetRolesQuery,
} from "src/store/api/roleApi";
import { IRole } from "src/interfaces/roles.interface";
import { usePageAuthorize } from "src/hooks/usePageAuthorize";
import { GET_GROUP, GET_GROUP_DETAIL, GET_ROLE } from "src/constants/roles.constants";
import { useTranslation } from "react-i18next";

const AuthorizationsPage = () => {
  // usePageAuthorize({ roleNames: [GET_ROLE, GET_GROUP, GET_GROUP_DETAIL] });
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  const currentFlag =
    i18n.language === "vi"
      ? "/VN.png" // icon cờ Việt Nam
      : "/EN.png"; // icon cờ Anh

  const [roleGroupActive, setRoleGroupActive] = useState<string | undefined>();
  const [rolesUpdate, setRolesUpdate] = useState<IRole[]>();

  const { data: roleGroupsData } = useGetRoleGroupsQuery({});
  const { data: rolesData } = useGetRolesQuery({});
  const { data: roleGroupDetailData, isFetching: isRoleGroupDetailFetching } =
    useGetRoleGroupDetailQuery(roleGroupActive || "", {
      skip: !roleGroupActive,
    });
  const [updateRoleGroup, { isSuccess }] = useCreateOrUpdateRoleGroupMutation();

  const handleSave = useCallback(() => {
    updateRoleGroup({ ...roleGroupDetailData!, roles: rolesUpdate || [] });
  }, [roleGroupDetailData, rolesUpdate, updateRoleGroup]);

  useEffect(() => {
    if (roleGroupDetailData) {
      setRolesUpdate(roleGroupDetailData.roles);
    }
  }, [roleGroupDetailData]);

  useEffect(() => {
    if (isSuccess) message.success("Cập nhật nhóm quyền thành công", 1000);
  }, [isSuccess]);

  return (
    <>
      {" "}
      {/* Nút đổi ngôn ngữ bằng emoji */}
      <div style={{ textAlign: "right", marginBottom: 12 }}>
        <Button
          onClick={toggleLanguage}
          shape="circle"
          style={{ width: 32, height: 32, padding: 0 }}
        >
          <img
            src={currentFlag}
            alt="flag"
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
        </Button>
      </div>
      <Card className="authorizations">
        <Row gutter={[24, 24]}>
          <Col className="group-roles" xs={24} xl={12}>
            <AuthorizationsGroupRoles
              roleGroups={roleGroupsData}
              roleGroupActive={roleGroupActive}
              setRoleGroupActive={setRoleGroupActive}
            />
          </Col>
          <Col className="roles" xs={24} xl={12}>
            <AuthorizationsRolesTable
              rolesUpdate={rolesUpdate}
              setRolesUpdate={setRolesUpdate}
              isLoading={isRoleGroupDetailFetching}
              roles={rolesData}
              handleSave={handleSave}
            />
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default AuthorizationsPage;
