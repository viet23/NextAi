import { Button, Checkbox, Empty, Flex, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Dispatch, SetStateAction, memo, useCallback, useMemo } from "react";
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
    const handleChangeRole = useCallback(
      (role: IRole) => {
        if (!rolesUpdate) return;

        if (rolesUpdate.find((x) => x.id === role.id))
          setRolesUpdate(rolesUpdate.filter((x) => x.id !== role.id));
        else setRolesUpdate([...rolesUpdate, role]);
      },
      [rolesUpdate, setRolesUpdate]
    );

    const columns = useMemo<ColumnsType<IRole>>(
      () => [
        {
          title: "NO",
          key: "index",
          width: 90,
          render: (_v, _r, index) => index + 1,
        },
        {
          title: "Permission name",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Describe",
          dataIndex: "description",
          key: "description",
        },
        {
          title: "Access",
          key: "id",
          dataIndex: "id",
          align: "center",
          width: 100,
          render: (value, record) => (
            <Checkbox
              checked={!!rolesUpdate?.find((x) => x.id === value)}
              onChange={() => handleChangeRole(record)}
            />
          ),
        },
      ],
      [handleChangeRole, rolesUpdate]
    );

    const dataSource = useMemo(
      () => (!rolesUpdate || !roles ? [] : roles),
      [roles, rolesUpdate]
    );

    return (
      <>
        <Flex align="center" justify="space-between">
          <Typography.Title className="title" level={4} color="#1B1B1B">
            Set permissions
          </Typography.Title>
          <ActionAuthorize roleNames={[CREATE_ROLE]}>
            <Button
              className="save-btn"
              size="large"
              type="primary"
              onClick={handleSave}
            >
              Save
            </Button>
          </ActionAuthorize>
        </Flex>
        <Table
          className="table-scroll"
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          locale={{
            emptyText: <Empty description="Please select permission group"></Empty>,
          }}
          scroll={{ x: 600, y: 500 }}
        />
      </>
    );
  }
);
