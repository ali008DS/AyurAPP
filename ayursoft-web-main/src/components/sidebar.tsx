import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useSidebar } from "../context/sidebar-context";
import { useAppContext } from "../context/app-context";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  Box,
  SxProps,
  Theme,
  Drawer,
} from "@mui/material";
import {
  TableProperties,
  Waves,
  LayoutDashboard,
  Album,
  ChevronDown,
  TicketCheck,
  ChevronUp,
  Users,
  CookingPot,
  Search,
  ReceiptText,
  PersonStanding,
  Hospital,
  BedSingle,
  Stethoscope,
  Settings,
  Settings2,
  UserRoundCog,
  UserRoundPlus,
  LogOut,
  ShoppingCart,
  PackagePlus,
  Warehouse,
  Bed,
  NotebookText,
  HousePlus,
  Hotel,
  Orbit,
  Truck,
  AudioWaveform,
  CalendarClock,
  CircleDotDashed,
  HandCoins,
} from "lucide-react";
import packageJson from "../../package.json";
import { useAppSelector } from "../redux/hooks";
import { usePermissions } from "../hooks/usePermissions";

const EXPANDED_WIDTH = 300;
const COLLAPSED_WIDTH = 0;

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  to?: string;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  level?: number;
  selected: string;
  setSelected: (selected: string) => void;
  onClick?: () => void;
}

function SidebarItem({
  icon,
  text,
  to,
  children,
  sx,
  level = 0,
  selected,
  setSelected,
  onClick,
}: SidebarItemProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isSelected = location.pathname === to || selected === to;
  const { isCollapsed } = useSidebar();
  const { themeColor } = useAppContext();

  // Helper to get translucent version of theme color
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const handleClick = () => {
    if (children) {
      setOpen(!open);
    }
    if (to) {
      setSelected(to);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <ListItem
        onClick={handleClick}
        component={to ? Link : "div"}
        {...(to ? { to } : {})}
        sx={{
          backgroundColor: isSelected
            ? hexToRgba(themeColor, 0.1)
            : "transparent",
          borderRadius: 3,
          "&:hover": {
            backgroundColor: hexToRgba(themeColor, 0.08),
            "& .MuiListItemText-root": {
              opacity: 1,
              visibility: "visible",
            },
          },
          userSelect: "none",
          cursor: onClick ? "pointer" : "default",
          ...sx,
        }}
      >
        <ListItemIcon
          sx={{
            color: isSelected ? themeColor : level > 0 ? "#4F4F4F" : "#393939",
            minWidth: isCollapsed ? "100%" : "40px",
            marginLeft: level > 0 ? "" : "0",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          sx={{
            opacity: isCollapsed ? 0 : 1,
            visibility: isCollapsed ? "hidden" : "visible",
            transition: (theme) =>
              theme.transitions.create(["opacity", "visibility"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }}
          primaryTypographyProps={{
            color: isSelected ? themeColor : level > 0 ? "#4F4F4F" : "#393939",
            fontSize: level > 0 ? "0.82rem" : "0.9rem",
            fontWeight: level > 0 ? "400" : "700",
            fontFamily: "Nunito, sans-serif",
            noWrap: true,
          }}
        />
        {!isCollapsed &&
          children &&
          (open ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
      </ListItem>
      {children && !isCollapsed && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {React.Children.map(children, (child) =>
              React.isValidElement<SidebarItemProps>(child)
                ? React.cloneElement(child, {
                  level: level + 1,
                  selected,
                  setSelected,
                })
                : child
            )}
          </List>
        </Collapse>
      )}
    </>
  );
}

function Sidebar() {
  const [selected, setSelected] = useState<string>("");
  const { logout, isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();
  const { websiteIdentity } = useAppContext();
  const navigate = useNavigate();
  const departments: string[] = JSON.parse(
    localStorage.getItem("department") ||
    sessionStorage.getItem("department") ||
    "[]"
  );

  useEffect(() => {
    // Check localStorage first (new), then sessionStorage (legacy)
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!user && !isAuthenticated) {
      navigate("/user-login");
    }
  }, [navigate, isAuthenticated]);

  usePermissions();

  const permissions = useAppSelector((state) => state.userRole.permissions);
  const hasPermission = (name: string) => {
    const permission = permissions.find((p) => p.name === name);
    return permission?.accessibility || false;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        zIndex: 50,
        color: "#393939",
        width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        visibility: isCollapsed ? "hidden" : "visible",
        "& .MuiDrawer-paper": {
          borderWidth: 0,
          width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          visibility: isCollapsed ? "hidden" : "visible",
        },
      }}
    >
      <Box sx={{
        scrollbar: 'hidden',
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        overflow: 'hidden',
      }}>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
            py: 1,
          }}
        >
          <ListItem
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              "&:hover": {
                backgroundColor: "#ECECEC",
                borderRadius: 2,
              },
            }}
          >
            <ListItemIcon>
              <img
                src={websiteIdentity.logo || "/images.png"}
                alt="logo not found"
                style={{
                  width: 35,
                  height: 35,
                  mixBlendMode: "multiply",
                  objectFit: "contain"
                }}
              />
            </ListItemIcon>
            {!isCollapsed && (
              <Box>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        maxHeight: "40px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      {(() => {
                        const nameParts = websiteIdentity.clinicName.split(' ');
                        const firstPart = nameParts[0];
                        const secondPart = nameParts.slice(1).join(' ');

                        return (
                          <>
                            <Typography
                              color="#555"
                              sx={{
                                fontWeight: "bold",
                                fontFamily: "Nunito, sans-serif",
                                fontSize: "1.1rem",
                                lineHeight: 1.1,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "200px"
                              }}
                            >
                              {firstPart}
                            </Typography>
                            {secondPart && (
                              <Typography
                                variant="body2"
                                color="#777"
                                sx={{
                                  fontFamily: "Nunito, sans-serif",
                                  fontWeight: "500",
                                  fontSize: "0.85rem",
                                  lineHeight: 1,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "200px"
                                }}
                              >
                                {secondPart}
                              </Typography>
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  }
                />
              </Box>
            )}
          </ListItem>
        </Box>
        <Box
          sx={{
            px: isCollapsed ? 0.5 : 2,
            overflowY: "auto",
            overflowX: "hidden",
            height: "calc(100vh - 64px)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                overflow: 'hidden',
              }}
            >
              {hasPermission("dashboard") && (
                <SidebarItem
                  icon={<LayoutDashboard size={20} />}
                  text="Dashboard"
                  to="/dashboard"
                  sx={{ px: isCollapsed ? 1 : 2 }}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}

              {/* beds */}
              {hasPermission("bed") && (
                <SidebarItem
                  icon={<Bed size={20} />}
                  text="Beds"
                  to="/settings/beds-management"
                  sx={{ px: isCollapsed ? 1 : 2 }}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}

              {/* search */}
              {(hasPermission("searchPatient") ||
                hasPermission("internalNote")) && (
                  <SidebarItem
                    icon={<Search size={20} />}
                    text="Search"
                    sx={{ px: isCollapsed ? 1 : 2, py: 1 }}
                    selected={selected}
                    setSelected={setSelected}
                  >
                    {hasPermission("searchPatient") && (
                      <SidebarItem
                        icon={<PersonStanding size={22} strokeWidth={2} />}
                        text="Search Patients"
                        to="/search"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("internalNote") && (
                      <SidebarItem
                        icon={<ReceiptText size={18} />}
                        text="Internal Notes"
                        to="/search-priscription"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("prescribedTests") && (
                      <SidebarItem
                        icon={<Orbit size={18} />}
                        text="Prescribed Tests"
                        to="/prescribed-tests"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                  </SidebarItem>
                )}

              <Divider sx={{ mt: 1 }} />

              {hasPermission("patient") && (
                <SidebarItem
                  icon={<Users size={20} />}
                  text="Patients"
                  to="/patients"
                  sx={{ px: isCollapsed ? 1 : 2 }}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}

              {/* opd */}
              {(hasPermission("spineOpd") || hasPermission("pilesOpd")) && (
                <SidebarItem
                  icon={<Stethoscope size={20} />}
                  text="OPD"
                  sx={{ px: isCollapsed ? 1 : 2 }}
                  selected={selected}
                  setSelected={setSelected}
                >
                  <SidebarItem
                    icon={<Warehouse size={18} />}
                    text="Today's General OPD"
                    to="/todays-general-opd"
                    sx={{ px: 3 }}
                    selected={selected}
                    setSelected={setSelected}
                  />

                  {(hasPermission("spineOpd") ||
                    departments.includes("spine") ||
                    sessionStorage.getItem("isAdmin") === "true") && (
                      <SidebarItem
                        icon={<Warehouse size={18} />}
                        text="Today's Spine OPD"
                        to="/todays-spine-opd"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                  {(hasPermission("pilesOpd") ||
                    departments.includes("piles") ||
                    sessionStorage.getItem("isAdmin") === "true") && (
                      <SidebarItem
                        icon={<Warehouse size={18} />}
                        text="Today's Piles OPD"
                        to="/todays-piles-opd"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                </SidebarItem>
              )}

              {/* // pharmacy  */}
              {(hasPermission("medicineManufacturer") ||
                hasPermission("medicineDistributor") ||
                hasPermission("medicine") ||
                hasPermission("medicinePurchase") ||
                hasPermission("medicineSale") ||
                hasPermission("saleHistory") ||
                hasPermission("medicineStock")) && (
                  <SidebarItem
                    icon={<Hotel size={20} />}
                    text="Pharmacy"
                    sx={{ px: isCollapsed ? 1 : 2 }}
                    selected={selected}
                    setSelected={setSelected}
                  >
                    {hasPermission("medicineManufacturer") && (
                      <SidebarItem
                        icon={<Hospital size={18} />}
                        text="Manufacturer"
                        to="/manufacturer"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("medicineDistributor") && (
                      <SidebarItem
                        icon={<Truck size={18} />}
                        text="Distributor"
                        to="/distributor"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("medicine") && (
                      <SidebarItem
                        icon={<HousePlus size={18} />}
                        text="Medicine"
                        to="/medicine"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("medicinePurchase") && (
                      <SidebarItem
                        icon={<ShoppingCart size={18} />}
                        text="Medicine Purchase"
                        to="/medicine-purchase"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("medicineSale") && (
                      <SidebarItem
                        icon={<PackagePlus size={18} />}
                        text="Medicine Sale"
                        to="/medicine-sale"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("saleHistory") && (
                      <SidebarItem
                        icon={<ReceiptText size={18} />}
                        text="Sale History"
                        to="/medicine-sale-history"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("medicineStock") && (
                      <SidebarItem
                        icon={<Warehouse size={18} />}
                        text="Medicine Stock"
                        to="/medicine-management"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                  </SidebarItem>
                )}

              <Divider sx={{ mt: 1 }} />

              {/* therapies */}
              {(hasPermission("therapyManagement") ||
                hasPermission("therapySession")) && (
                  <SidebarItem
                    icon={<Waves size={20} />}
                    text="Therapies"
                    sx={{ px: isCollapsed ? 1 : 2 }}
                    selected={selected}
                    setSelected={setSelected}
                  >
                    {hasPermission("therapyManagement") && (
                      <SidebarItem
                        icon={<AudioWaveform size={18} />}
                        text="Therapy Management"
                        to="/therapy-management"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}

                    {hasPermission("therapySession") && (
                      <SidebarItem
                        icon={<CalendarClock size={18} />}
                        text="Therapy Session"
                        to="/therapy-session"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                  </SidebarItem>
                )}

              {/* reports */}
              {(hasPermission("trackingReport") ||
                hasPermission("bedOccupancyReport")) && (
                  <SidebarItem
                    icon={<NotebookText size={20} />}
                    text="Reports"
                    sx={{ px: isCollapsed ? 1 : 2 }}
                    selected={selected}
                    setSelected={setSelected}
                  >
                    {hasPermission("trackingReport") && (
                      <SidebarItem
                        icon={<TableProperties size={18} />}
                        text="Tracking Reports"
                        to="/tracking-reports"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}

                    {hasPermission("bedOccupancyReport") && (
                      <SidebarItem
                        icon={<BedSingle size={18} />}
                        text="Bed Occupancy"
                        to="/bed-occupancy-reports"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                  </SidebarItem>
                )}

              {/* // registers */}
              {(hasPermission("medicinePrepUtensils") ||
                hasPermission("medicinePrepRes") ||
                hasPermission("medicinePrepChecked") ||
                hasPermission("panchkarmaUtensils") ||
                hasPermission("panchkarmaRes") ||
                hasPermission("panchkarmaChecked")) && (
                  <SidebarItem
                    icon={<Album size={20} />}
                    text="Registers"
                    sx={{ px: isCollapsed ? 1 : 2 }}
                    selected={selected}
                    setSelected={setSelected}
                  >
                    {(hasPermission("medicinePrepUtensils") ||
                      hasPermission("medicinePrepRes") ||
                      hasPermission("medicinePrepChecked")) && (
                        <SidebarItem
                          icon={<PackagePlus size={18} />}
                          text="Medicine Preparation Room Register"
                          sx={{ px: 3 }}
                          selected={selected}
                          setSelected={setSelected}
                        >
                          {hasPermission("medicinePrepUtensils") && (
                            <SidebarItem
                              icon={<CookingPot size={16} />}
                              text="Mgmt MedPrep"
                              to="/registers/medicine-preparation/utensils"
                              sx={{ px: 5 }}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          )}

                          {hasPermission("medicinePrepRes") && (
                            <SidebarItem
                              icon={<CircleDotDashed size={16} />}
                              text="Responsibility"
                              to="/registers/medicine-preparation/responsibility"
                              sx={{ px: 5 }}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          )}

                          {hasPermission("medicinePrepChecked") && (
                            <SidebarItem
                              icon={<TicketCheck size={16} />}
                              text="Checked By"
                              to="/registers/medicine-preparation/checked-by"
                              sx={{ px: 5 }}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          )}

                          {/* {hasPermission("medicinePrepChecked") && (
                            <SidebarItem
                              icon={<PackagePlus size={18} />}
                              text="Panchakarma Use"
                              to="/panchakarma-use"
                              sx={{ px: 5 }}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          )} */}

                          {/* {hasPermission("medicinePrepChecked") && (
                      <SidebarItem
                        icon={<PillBottle size={16} />}
                        text="Medicine Room"
                        to="/registers/medicine-preparation/medicine-room"
                        sx={{ px: 5 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )} */}
                        </SidebarItem>
                      )}

                    {(hasPermission("panchkarmaUtensils") ||
                      hasPermission("panchkarmaRes") ||
                      hasPermission("panchkarmaChecked")) && (
                        <SidebarItem
                          icon={<Waves size={18} />}
                          text="Panchkarma Inventory Register"
                          sx={{ px: 3 }}
                          selected={selected}
                          setSelected={setSelected}
                        >
                          {hasPermission("panchkarmaUtensils") && (
                            <SidebarItem
                              icon={<CookingPot size={16} />}
                              text="Mgmt Utensils."
                              to="/registers/panchkarma-inventory/utensils"
                              sx={{ px: 5 }}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          )}
                          {hasPermission("panchkarmaRes") && (
                            <SidebarItem
                              icon={<CircleDotDashed size={16} />}
                              text="Responsibility"
                              to="/registers/panchkarma-inventory/responsibility"
                              sx={{ px: 5 }}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          )}

                          {hasPermission("panchkarmaChecked") && (
                            <SidebarItem
                              icon={<TicketCheck size={16} />}
                              text="Checked By"
                              to="/registers/panchkarma-inventory/checked-by"
                              sx={{ px: 5 }}
                              selected={selected}
                              setSelected={setSelected}
                            />
                          )}
                        </SidebarItem>
                      )}
                  </SidebarItem>
                )}

              {/* // Panchakarma Medicine  */}
              {(hasPermission("medicineManufacturer") ||
                hasPermission("medicineDistributor") ||
                hasPermission("medicine") ||
                hasPermission("medicinePurchase") ||
                hasPermission("medicineSale") ||
                hasPermission("saleHistory") ||
                hasPermission("medicineStock")) && (
                  <SidebarItem
                    icon={<HandCoins size={20} />}
                    text="Panchakarma Medicine"
                    sx={{ px: isCollapsed ? 1 : 2 }}
                    selected={selected}
                    setSelected={setSelected}
                  >
                    {hasPermission("medicinePurchase") && (
                      <SidebarItem
                        icon={<ShoppingCart size={18} />}
                        text="Panchakarma Purchase"
                        to="/Panchakarma-purchase"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("medicineStock") && (
                      <SidebarItem
                        icon={<Warehouse size={18} />}
                        text="Panchakarma Stock"
                        to="/panchakarma-stock"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("medicineSale") && (
                      <SidebarItem
                        icon={<PackagePlus size={18} />}
                        text="Panchakarma Sale"
                        to="/panchakarma-sale"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {hasPermission("saleHistory") && (
                      <SidebarItem
                        icon={<ReceiptText size={18} />}
                        text="Panchakarma Sale History"
                        to="/panchakarma-sale-history"
                        sx={{ px: 3 }}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                  </SidebarItem>
                )}
            </Box>

            {/* user management */}
            {(hasPermission("createUser") || hasPermission("userRole")) && (
              <SidebarItem
                icon={<UserRoundCog size={20} />}
                text="User Mgmt."
                sx={{ px: isCollapsed ? 1 : 2 }}
                selected={selected}
                setSelected={setSelected}
              >
                {hasPermission("createUser") && (
                  <SidebarItem
                    icon={<UserRoundPlus size={18} />}
                    text="Total Users"
                    to="/create-user"
                    sx={{ px: 3 }}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )}
                {hasPermission("userRole") && (
                  <SidebarItem
                    icon={<Settings2 size={18} />}
                    text="User Roles"
                    to="/create-user-roles"
                    sx={{ px: 3 }}
                    selected={selected}
                    setSelected={setSelected}
                  />
                )}
              </SidebarItem>
            )}

            <Divider sx={{ mt: 1 }} />
            <List>
              {hasPermission("setting") && (
                <SidebarItem
                  icon={<Settings size={20} />}
                  text="Settings"
                  to="/settings"
                  sx={{ px: isCollapsed ? 1 : 2 }}
                  selected={selected}
                  setSelected={setSelected}
                />
              )}
            </List>
          </Box>
          <Box sx={{ mt: 2, mb: 2 }}>
            <SidebarItem
              icon={<LogOut size={20} />}
              text={"Logout " + " v" + packageJson.version}
              selected={selected}
              setSelected={setSelected}
              onClick={logout}
            />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
