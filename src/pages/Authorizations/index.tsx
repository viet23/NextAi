import "./Authorizations.scss";
import { Card, Col, Layout, Row, message } from "antd";
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
import { Content } from "antd/es/layout/layout";

const AuthorizationsPage = () => {
  // usePageAuthorize({ roleNames: [GET_ROLE, GET_GROUP, GET_GROUP_DETAIL] });

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
      <Layout style={{ minHeight: "100vh", background: "#0D0F1A" }}>
        <Content style={{ padding: 24 }}>
          <Card className="authorizations">
            <Row gutter={[24, 24]}>
              <Col className="group-roles" xs={24} xl={10}>
                <AuthorizationsGroupRoles
                  roleGroups={roleGroupsData}
                  roleGroupActive={roleGroupActive}
                  setRoleGroupActive={setRoleGroupActive}
                />
              </Col>
              <Col className="roles" xs={24} xl={14}>
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
        </Content>
      </Layout>
    </>
  );
};

export default AuthorizationsPage;
