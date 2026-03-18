import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Home,
  Package,
  Phone,
  Info,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
const NavBar = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll detection (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleScroll = () => {
      const scrollThreshold = 100;
      if (window.scrollY > scrollThreshold) {
        setIsScrolled(true);
      } else if (window.scrollY < 50) {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const isAuthenticated = localStorage.getItem("access_token");

  // Mobile navigation items
  const mobileNavItems = [
    { name: "Home", icon: <Home size={22} />, path: "/" },
    { name: "Services", icon: <Package size={22} />, path: "/services" },
    { name: "Contact", icon: <Phone size={22} />, path: "/contact" },
    { name: "About", icon: <Info size={22} />, path: "/about" },
    {
      name: isAuthenticated ? "Profile" : "Login",
      icon: <User size={22} />,
      path: isAuthenticated ? "/dashboard" : "/login",
    },
  ];

  // Mobile View
  if (isMobile) {
    return (
      <>
        {/* Spacer for fixed navbar */}
        <div className="h-16 md:hidden" />

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
          <div className="flex items-center justify-between px-2 py-3">
            {mobileNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`mb-1 ${
                    location.pathname === item.path ? "scale-110" : ""
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            ))}

            {isAuthenticated && (
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
                className="flex flex-col items-center justify-center flex-1 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={22} className="mb-1" />
                <span className="text-xs font-medium">Logout</span>
              </button>
            )}
          </div>
        </nav>
      </>
    );
  }

  const desktopNavItems = [
    { name: "Home", icon: <Home size={22} />, path: "/" },
    { name: "Services", icon: <Package size={22} />, path: "/services" },
    { name: "Contact", icon: <Phone size={22} />, path: "/contact" },
    { name: "About", icon: <Info size={22} />, path: "/about" },
  ];
  // Desktop View
  const navbarBaseStyles =
    "sticky top-0 z-50 w-full transition-all duration-300";
  const navbarStyles = isScrolled
    ? `${navbarBaseStyles} py-2 sm:py-4`
    : `${navbarBaseStyles} py-4 sm:py-6`;
  const isLandingPage = location.pathname === "/";
  return (
    <header className={`${navbarStyles}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between h-14 sm:h-16 rounded-full px-4 sm:px-6 transition-all duration-300 ${
            isScrolled
              ? "bg-primary"
              : isLandingPage
                ? "bg-white backdrop-blur-sm"
                : " dark:bg-gray-800"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center gap-2">
              <div className="">
                <Logo
                  text={false}
                  containerClassName="h-10 w-20"
                  isColored={isLandingPage && !isScrolled}
                />
              </div>
              <span
                className={`text-lg sm:text-xl font-bold font-serif tracking-wide transition-colors duration-300  dark:text-white ${isScrolled ? "text-white" : "text-primary dark:text-white"}`}
              >
                DOKO Namlo
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-2">
            {
              // Desktop Navigation
              desktopNavItems?.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium rounded-full px-4 py-2 transition-all duration-300 ${
                    isScrolled
                      ? "text-white/90 hover:bg-white/10"
                      : "text-black dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-200"
                  }`}
                >
                  {item.name}
                </Link>
              ))
            }
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                isScrolled
                  ? "text-white hover:bg-white/10"
                  : "text-white dark:text-gray-300 hover:bg-gray-500 dark:hover:bg-gray-700"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            <Button
              onClick={() => navigate("/register")}
              className={`rounded-full px-6 sm:px-8 py-2 hover:scale-105 transition-all duration-300 font-medium cursor-pointer ${
                isScrolled
                  ? "bg-white hover:bg-white/90 text-[hsl(220,50%,20%)]"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              Join Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
