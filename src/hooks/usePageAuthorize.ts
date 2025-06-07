import { useSelector } from "react-redux";
import { HOME_ROUTE } from "src/constants/routes.constants";
import { IRootState } from "src/interfaces/app.interface";
import { IRole } from "src/interfaces/roles.interface";

interface IProps {
  roleNames?: string[];
  redirect?: string;
}

export const usePageAuthorize = ({
  redirect = HOME_ROUTE,
  roleNames = [],
}: IProps) => {
  const authRoles = useSelector<IRootState>(
    (state) => state.auth.roles
  ) as IRole[];

  if (!roleNames.every((name) => authRoles.find((x) => x.name === name))) {
    document.location = redirect;
  }
};
