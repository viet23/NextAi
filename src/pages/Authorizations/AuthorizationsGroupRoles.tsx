import { Button, Col, List, Row, Typography } from "antd";
import { Dispatch, SetStateAction, memo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ActionAuthorize } from "src/components/ActionAuthorize";
import { PlusIcon } from "src/components/MenuItemIcon";
import { TooltipParagraph } from "src/components/TooltipParagraph";
import { CREATE_GROUP } from "src/constants/roles.constants";
import { ROLE_GROUPS_CREATE_ROUTE } from "src/constants/routes.constants";
import { IRoleGroup } from "src/interfaces/roles.interface";
import "./Authorizations.scss";

interface IProps {
  roleGroups?: IRoleGroup[];
  roleGroupActive?: string;
  setRoleGroupActive: Dispatch<SetStateAction<string | undefined>>;
}

export const AuthorizationsGroupRoles = memo(
  ({ roleGroups, roleGroupActive, setRoleGroupActive }: IProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const navigateToCreate = () => {
      navigate(ROLE_GROUPS_CREATE_ROUTE);
    };

    const handleSelect = (value: string) => {
      setRoleGroupActive(value);
    };

    return (
      <>
        <Row gutter={[24, 0]}>
          <Col xs={18} md={12} lg={21}>
            <Typography.Title className="title border-b" level={4} color="#1B1B1B">
              {t("auth_groups.title")}
            </Typography.Title>
          </Col>
        </Row>
        <Row gutter={[24, 0]}>
          <Col xs={18} md={12} lg={21}>
            <List>
              {roleGroups?.map(group => (
                <List.Item
                  className={`list-item ${roleGroupActive === group.id ? "active" : ""}`}
                  key={group.name}
                  onClick={() => handleSelect(group.id)}
                >
                  <TooltipParagraph>{group.name}</TooltipParagraph>
                </List.Item>
              ))}
            </List>
          </Col>
          <ActionAuthorize roleNames={[CREATE_GROUP]}>
            <Col xs={6} md={12} lg={3}>
              <Button className="add-btn" type="primary" onClick={navigateToCreate}>
                <PlusIcon />
              </Button>
            </Col>
          </ActionAuthorize>
        </Row>
      </>
    );
  }
);
