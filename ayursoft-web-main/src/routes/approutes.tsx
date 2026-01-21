import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Enquiries from "../pages/Enquiries";
import PatientsListLayout from "../pages/PatientsListLayout";
import SearchPage from "../pages/SearchPage";
import SearchPriscriptionLayout from "../pages/SearchPriscriptionPage";
import PrescribedTests from "../pages/prescribed-tests";
import DepartmentManagement from "../pages/department-management";
import TodaysOPD from "../pages/todays-spine-opd";

import MedicineManagement from "../pages/MedicineManagement";
import PanchakarmaStock from "../pages/PanchakarmaStock";
import MedicineSale from "../pages/MedicineSale";
import PanchakarmaSale from "../pages/Panchakarma-Sale";
import DiagnosticCenter from "../components/settings/diagnostics-management/center-mgmt/DiagnosticCenter";
import Settings from "../pages/settings";
import PrescriptionWrapper from "../pages/prescription-wrapper";
import PilesPrescriptionWrapper from "../pages/piles-prescription-wrapper";
import GeneralPrescriptionWrapper from "../pages/general-prescription-wrapper";
import AdminLogin from "../components/auth-pages/admin-login";
import UserLogin from "../components/auth-pages/user-login";
import CreateUser from "../pages/create-user";
import CreateUserRoles from "../pages/create-user-roles";
import ProtectedRoute from "../components/protected-route";
import { useLocation } from "react-router-dom";
import NotFound from "../pages/NotFound";

// SETTINGS PAGES IMPORTS
import WebsiteSettings from "../components/settings/website-settings/website-settings";
import TestsManagement from "../components/settings/tests/tests-management";
import CarePlan from "../components/settings/care-plan/careplan-managment";
import InternalNotes from "../components/settings/internal-note/internal-note-managment";
import BankDetails from "../components/settings/bank-details/bank-managment";
import BedsManagement from "../components/settings/beds-management/beds-management";
import WhenHowManagement from "../components/settings/rx-management/when&how-mgmt-page";
import MedicineUnits from "../components/settings/medicineunits/medicine-units";
import DiagnosticsManagement from "../components/settings/diagnostics-management/diagnostics-mgmt-page";
import UnitsManagement from "../pages/units-management";
import TodayPilesOPD from "../pages/today-piles-opd";
import PanchakarmaManagement from "../components/settings/panchakarma-management/panchakarma-mgmt-page";
import MedicinePurchase from "../pages/medicine-purchase";
import PanchakarmaPurchase from "../pages/panchakarma-purchase ";
import MedicineSaleHistory from "../pages/medicine-sale-history";
import PanchakarmaSaleHistory from "../pages/Panchakarma-sale-history";
import MedicineSaleView from "../pages/medicine-sale-view";
import PanchakarmaSaleView from "../pages/panchakarma-sale-view";
import MedicineSaleEdit from "../pages/MedicineSaleEdit";
import Manufacturer from "../pages/manufacturer";
import Medicine from "../pages/medicine";
import DistributorPage from "../pages/distributor";
import TrackingReports from "../pages/trackingReports";
import BedOccupancy from "../pages/bedOccupancy";
import TherapyManagement from "../pages/therapyManagment";
import TherapySessions from "../pages/therapySessions";

// Registers pages
import UtensilsRegRoom from "../pages/registers/register-room-medicine-preparation/UtensilsMgmt";
import UtensilPanchkarmaInventory from "../pages/registers/panchkarma-inventory/UtensilsMgmt";
import RegRoomResponsibility from "../pages/registers/register-room-medicine-preparation/Reponsiblity";
import PanchkarmaResponsibility from "../pages/registers/panchkarma-inventory/Reponsiblity";
import PanchakarmaCheckedBy from "../pages/registers/panchkarma-inventory/CheckedBy";
import RegRoomCheckedBy from "../pages/registers/register-room-medicine-preparation/CheckedBy";
import MedRoom from "../pages/registers/register-room-medicine-preparation/MedicineRoom";
import TherapyDocs from "../pages/therapyDocs";
import TodaysGeneralOpd from "../pages/todays-general-opd";

const AppRoutes = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/admin-login" ||
    location.pathname === "/user-login" ||
    location.pathname === "/admin-login/" ||
    location.pathname === "/user-login/";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-login/" element={<AdminLogin />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-login/" element={<UserLogin />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      <div
        style={{
          flexGrow: 1,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          borderRadius: "1.5rem",
          position: "relative",
          zIndex: 10,
          marginTop: "0.75rem",
          marginRight: "0.5rem",
          marginBottom: "0.5rem",
          marginLeft: "0.5rem",
        }}
      >
        <div
          style={{
            height: "100%",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "blue-300 transparent",
            overflow: "hidden",
          }}
          className="custom-scrollbar"
        >
          <Routes>
            {/* Protected Routes */}
            {/* Settings page Routes */}
            {/* Registers */}
            <Route
              path="registers/medicine-preparation/utensils"
              element={<UtensilsRegRoom />}
            />
            <Route
              path="registers/panchkarma-inventory/utensils"
              element={<UtensilPanchkarmaInventory />}
            />
            <Route
              path="registers/medicine-preparation/responsibility"
              element={<RegRoomResponsibility />}
            />
            <Route
              path="registers/panchkarma-inventory/responsibility"
              element={<PanchkarmaResponsibility />}
            />
            {/* checked-by */}
            <Route
              path="registers/panchkarma-inventory/checked-by"
              element={<PanchakarmaCheckedBy />}
            />
            <Route
              path="registers/medicine-preparation/checked-by"
              element={<RegRoomCheckedBy />}
            />
            {/* Reports */}
            <Route path="tracking-reports" element={<TrackingReports />} />
            <Route path="bed-occupancy-reports" element={<BedOccupancy />} />
            {/* Therapy Routes */}
            <Route path="therapy-management" element={<TherapyManagement />} />
            <Route path="therapy-session" element={<TherapySessions />} />
            {/* Settings Routes */}
            <Route
              path="settings/website-settings"
              element={<WebsiteSettings />}
            />
            <Route
              path="settings/tests-management"
              element={
                <ProtectedRoute>
                  <TestsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/care-plans"
              element={
                <ProtectedRoute>
                  <CarePlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/internal-notes"
              element={
                <ProtectedRoute>
                  <InternalNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/bank-details"
              element={
                <ProtectedRoute>
                  <BankDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/beds-management"
              element={
                <ProtectedRoute>
                  <BedsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/rx-group"
              element={
                <ProtectedRoute>
                  <WhenHowManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/panchakarma-management"
              element={
                <ProtectedRoute>
                  <PanchakarmaManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/units-management"
              element={
                <ProtectedRoute>
                  <UnitsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/medicine-units"
              element={
                <ProtectedRoute>
                  <MedicineUnits />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/diagnostics-management"
              element={
                <ProtectedRoute>
                  <DiagnosticsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/diagnostic-centers"
              element={
                <ProtectedRoute>
                  <DiagnosticCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path=""
              element={<Navigate to="/patients" replace />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="Enquiries"
              element={
                <ProtectedRoute>
                  <Enquiries />
                </ProtectedRoute>
              }
            />
            <Route
              path="patients"
              element={
                <ProtectedRoute>
                  <PatientsListLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="department-management"
              element={
                <ProtectedRoute>
                  <DepartmentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="search-priscription"
              element={
                <ProtectedRoute>
                  <SearchPriscriptionLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="prescribed-tests"
              element={
                <ProtectedRoute>
                  <PrescribedTests />
                </ProtectedRoute>
              }
            />
            <Route
              path="todays-general-opd"
              element={
                <ProtectedRoute>
                  <TodaysGeneralOpd />
                </ProtectedRoute>
              }
            />
            <Route
              path="todays-spine-opd"
              element={
                <ProtectedRoute>
                  <TodaysOPD />
                </ProtectedRoute>
              }
            />
            <Route
              path="todays-piles-opd"
              element={
                <ProtectedRoute>
                  <TodayPilesOPD />
                </ProtectedRoute>
              }
            />
            <Route
              path="medicine-management"
              element={
                <ProtectedRoute>
                  <MedicineManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="medicine-purchase"
              element={
                <ProtectedRoute>
                  <MedicinePurchase />
                </ProtectedRoute>
              }
            />
            <Route
              path="medicine-sale"
              element={
                <ProtectedRoute>
                  <MedicineSale />
                </ProtectedRoute>
              }
            />
            <Route
              path="medicine-sale-history"
              element={
                <ProtectedRoute>
                  <MedicineSaleHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="medicine-sale-view/:id"
              element={
                <ProtectedRoute>
                  <MedicineSaleView />
                </ProtectedRoute>
              }
            />
            <Route
              path="medicine-sale-edit/:id"
              element={
                <ProtectedRoute>
                  <MedicineSaleEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="manufacturer"
              element={
                <ProtectedRoute>
                  <Manufacturer />
                </ProtectedRoute>
              }
            />
            <Route
              path="distributor"
              element={
                <ProtectedRoute>
                  <DistributorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="medicine"
              element={
                <ProtectedRoute>
                  <Medicine />
                </ProtectedRoute>
              }
            />
            <Route
              path="therapy-docs/:id"
              element={
                <ProtectedRoute>
                  <TherapyDocs />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="prescription/create/:patientId/:prescriptionID"
              element={
                <ProtectedRoute>
                  <PrescriptionWrapper mode="create" />
                </ProtectedRoute>
              }
            />{" "}
            <Route
              path="prescription/edit/:patientId/:prescriptionID"
              element={
                <ProtectedRoute>
                  <PrescriptionWrapper mode="edit" />
                </ProtectedRoute>
              }
            />
            <Route
              path="general-prescription/create/:patientId/:prescriptionID"
              element={
                <ProtectedRoute>
                  <GeneralPrescriptionWrapper mode="create" />
                </ProtectedRoute>
              }
            />
            <Route
              path="general-prescription/edit/:patientId/:prescriptionID"
              element={
                <ProtectedRoute>
                  <GeneralPrescriptionWrapper mode="edit" />
                </ProtectedRoute>
              }
            />
            <Route
              path="piles-prescription/create/:patientId/:prescriptionID"
              element={
                <ProtectedRoute>
                  <PilesPrescriptionWrapper mode="create" />
                </ProtectedRoute>
              }
            />
            <Route
              path="piles-prescription/edit/:patientId/:prescriptionID"
              element={
                <ProtectedRoute>
                  <PilesPrescriptionWrapper mode="edit" />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-user"
              element={
                <ProtectedRoute>
                  <CreateUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-user-roles"
              element={
                <ProtectedRoute>
                  <CreateUserRoles />
                </ProtectedRoute>
              }
            />

            {/* PanchakarmaPurchase */}
            <Route path="/panchakarma-purchase" element={<PanchakarmaPurchase />} />
            <Route path="/panchakarma-stock" element={<PanchakarmaStock />} />
            <Route path="/panchakarma-use" element={<MedRoom />} />
            <Route path="/panchakarma-sale" element={<PanchakarmaSale />} />
            <Route path="/panchakarma-sale-history" element={<PanchakarmaSaleHistory />} />
            <Route path="/panchakarma-sale-view/:id" element={
                <ProtectedRoute>
                  <PanchakarmaSaleView />
                </ProtectedRoute>
              }
            />


            <Route path="/404" element={<NotFound />} />
            {/* <Route path="*" element={<Navigate to="/404" replace />} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AppRoutes;
