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
import navItems from "./component/nav-items";

const AppSidebar = () => {
  const isActive = (item) => {
    return item.to === window.location.pathname;
  };
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Logo />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-bold text-primary whitespace-nowrap">
              DOKO Namlo
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">
              Dashboard
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-1 bg-primary/80">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className={
                      isActive(item)
                        ? "data-[active=true]:bg-primary data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:shadow-primary/20 bg-white text-primary"
                        : "text-primary-foreground"
                    }
                  >
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      {item.icon}
                      <span>{item.label}</span>
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
