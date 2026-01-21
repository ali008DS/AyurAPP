import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { RootState, AppDispatch } from "../store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePermission = (permissionName: string) => {
  const permission = useAppSelector((state) =>
    state.userRole.permissions.find((p) => p.name === permissionName)
  );

  return permission || { name: permissionName, accessibility: false };
};
