import { Button, Checkbox, Empty, Flex, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Dispatch, SetStateAction, memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActionAuthorize } from "src/components/ActionAuthorize";
import { CREATE_ROLE } from "src/constants/roles.constants";
import { IRole, IRoleGroup, IRoleRow } from "src/interfaces/roles.interface";

interface IProps {
  rolesUpdate?: IRole[];
  setRolesUpdate: Dispatch<SetStateAction<IRole[] | undefined>>;
  isLoading: boolean;
  roles?: IRole[];
  handleSave: () => void;
}

export const AuthorizationsRolesTable = memo(
  ({ rolesUpdate, setRolesUpdate, isLoading, roles, handleSave }: IProps) => {
    const { t } = useTranslation();
    const handleChangeRole = useCallback(
      (role: IRole) => {
        if (!rolesUpdate) return;

        if (rolesUpdate.find(x => x.id === role.id))
          setRolesUpdate(rolesUpdate.filter(x => x.id !== role.id));
        else setRolesUpdate([...rolesUpdate, role]);
      },
      [rolesUpdate, setRolesUpdate]
    );

    const columns = useMemo<ColumnsType<IRole>>(
      () => [
        {
          title: t("roles.no"),
          key: "index",
          width: 90,
          render: (_v, _r, index) => index + 1,
        },
        {
          title: t("roles.permission_name"),
          dataIndex: "name",
          key: "name",
        },
        {
          title: t("roles.description"),
          dataIndex: "description",
          key: "description",
        },
        {
          title: t("roles.access"),
          key: "id",
          dataIndex: "id",
          align: "center",
          width: 100,
          render: (value, record) => (
            <Checkbox
              checked={!!rolesUpdate?.find(x => x.id === value)}
              onChange={() => handleChangeRole(record)}
            />
          ),
        },
      ],
      [handleChangeRole, rolesUpdate, t]
    );

    const dataSource = useMemo(() => (!rolesUpdate || !roles ? [] : roles), [roles, rolesUpdate]);

    return (
      <>
        <Flex align="center" justify="space-between">
          <Typography.Title className="title" level={4} color="#1B1B1B">
            {t("roles.title")}
          </Typography.Title>
          <ActionAuthorize roleNames={[CREATE_ROLE]}>
            <Button className="save-btn" size="large" type="primary" onClick={handleSave}>
              {t("common.save")}
            </Button>
          </ActionAuthorize>
        </Flex>
        <Table
          className="table-scroll dark-header-table"
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          locale={{
            emptyText: <Empty description={t("roles.empty")} />,
          }}
          scroll={{ x: 600, y: 500 }}
        />

        {/* 🎯 Style ép màu header bảng giống ảnh bạn gửi */}
        <style>
          {`
      .dark-header-table .ant-table-thead > tr > th {
        background-color: #1e293b !important; /* nền xanh đậm */
        color: #e2e8f0 !important;            /* chữ xám nhạt */
        font-weight: 500;
        text-transform: uppercase;
        font-size: 13px;
      }
    `}
        </style>
      </>
    );
  }
);
