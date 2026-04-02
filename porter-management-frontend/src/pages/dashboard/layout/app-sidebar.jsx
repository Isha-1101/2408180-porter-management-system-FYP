import { NavLink } from "react-router-dom";
import Logo from "../../../components/common/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../components/ui/sidebar";
import { useAuthStore } from "../../../store/auth.store";
import getNavItems from "./component/nav-items";

const SIDEBAR_BG = "#0C4C40";
const SIDEBAR_ACTIVE_BG = "#FFFFFF";
const SIDEBAR_ACTIVE_TEXT = "#0C4C40";
const SIDEBAR_HOVER_BG = "rgba(255, 255, 255, 0.15)";
const SIDEBAR_TEXT = "#FFFFFF";

const AppSidebar = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;
  const navItems = getNavItems(role);

  return (
    <Sidebar
      collapsible="icon"
      className="
        border-none shadow-xl overflow-hidden
        transition-all duration-300
        group-data-[collapsible=icon]:rounded-r-3xl
      "
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      {/* Header */}
      <SidebarHeader
        className="border-none group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 -ml-1">
          {/* Logo icon — always visible, no circle background */}
          <div className="shrink-0 w-17 h-18 flex items-center justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
            <Logo containerClassName="w-full h-full" />
          </div>
          {/* Text — hidden when collapsed */}
          <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
            <div className="font-bold text-white whitespace-nowrap tracking-wide text-base">
              DOKO Namlo
            </div>
            <div className="text-xs text-white/60 whitespace-nowrap">
              Dashboard
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav Items */}
      <SidebarContent
        className="p-2 border-none"
        style={{ backgroundColor: SIDEBAR_BG, color: SIDEBAR_TEXT }}
      >
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className="h-auto p-0 bg-transparent hover:bg-transparent"
                  >
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full",
                          /* Collapsed: centre the icon chip */
                          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:mx-auto",
                          isActive
                            ? /* Active – white background with sidebar blue text */
                            "bg-white text-[#0C4C40] font-semibold shadow-md"
                            : /* Idle – white text with subtle hover */
                            "text-white hover:bg-white/15 hover:shadow-sm",
                        ].join(" ")
                      }
                    >
                      {/* Icon wrapper keeps size consistent */}
                      <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                      {/* Label – hidden in collapsed mode */}
                      <span className="group-data-[collapsible=icon]:hidden whitespace-nowrap text-sm">
                        {item.label}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
