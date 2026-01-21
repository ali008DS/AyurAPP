import { AUTH_ROUTES } from "../constants/routes";

export const isAuthRoute = (pathname: string) =>
  AUTH_ROUTES.some((route) => pathname === route || pathname === `${route}/`);
