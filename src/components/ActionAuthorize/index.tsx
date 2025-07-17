import { ReactNode, memo } from "react";
import { useSelector } from "react-redux";
import { IRootState } from "src/interfaces/app.interface";
import { IRole } from "src/interfaces/roles.interface";

interface IProps {
  roleNames?: string[];
  children: ReactNode;
}

export const ActionAuthorize = memo(({ roleNames = [], children }: IProps) => {
  const authRoles = useSelector<IRootState>(state => state.auth.roles) as IRole[];

  return !roleNames.every(name => authRoles?.find(x => x.name === name)) ? null : <>{children}</>;
});
