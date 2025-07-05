import { api } from "./base";
import { IRole, IRoleGroup, IRoleGroupCreateForm } from "src/interfaces/roles.interface";

const RoleApi = api.injectEndpoints({
  endpoints: build => ({
    getRoles: build.query<IRole[], any>({
      query: () => ({
        url: "/api/v1/roles",
        method: "GET",
      }),
    }),
    getRoleGroups: build.query<IRoleGroup[], any>({
      query: () => ({
        url: "/api/v1/roles/group",
        method: "GET",
      }),
    }),
    getRoleGroupDetail: build.query<IRoleGroup, string>({
      query: roleGroupId => ({
        url: `/api/v1/roles/group/${roleGroupId}`,
        method: "GET",
      }),
    }),
    createOrUpdateRoleGroup: build.mutation<IRoleGroup, IRoleGroupCreateForm | IRoleGroup>({
      query: body => ({
        url: "/api/v1/roles/group",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleGroupsQuery,
  useLazyGetRoleGroupsQuery,
  useGetRoleGroupDetailQuery,
  useCreateOrUpdateRoleGroupMutation,
} = RoleApi;
export default RoleApi;
