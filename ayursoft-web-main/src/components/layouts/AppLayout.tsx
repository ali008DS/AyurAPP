import { useLocation } from "react-router-dom";
import { isAuthRoute } from "../../utils/route-helpers";
import { AuthContainer } from "../ui/layouts";
import AppContent from "../../routes/approutes";
import Sidebar from "../sidebar";

export const AppLayout = () => {
  const location = useLocation();

  return isAuthRoute(location.pathname) ? (
    <AuthContainer>
      <AppContent />
    </AuthContainer>
  ) : (
    <>
      <Sidebar />
      <AppContent />
    </>
  );
};
