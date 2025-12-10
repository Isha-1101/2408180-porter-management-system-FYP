import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "../../assets/Images/Logo2.png";

const NavBar = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 py-2 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 bg-[hsl(220,50%,20%,0.85)] backdrop-blur-md rounded-full px-4 sm:px-6 shadow-lg">
          
          {/* Logo */}
<div className="flex items-center min-w-0">
  <a href="/" className="flex items-center gap-2">
    
    {/* Logo Container (gives consistent size and shape) */}
    <div className="w-50 h-50 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden">
      <img
        src={Logo}
        alt="Logo"
        className="w-full h-full object-contain"
      />
    </div>

    {/* Logo Text */}
    <span className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
      Doko-Namlo
    </span>
  </a>
</div>

          {/* Desktop Navigation */}
          <nav className="flex items-center gap-2">
            <a href="/" className="text-sm font-medium text-white/90 hover:bg-white/10 rounded-full px-4 py-2 transition-all">
              Home
            </a>
            <a href="/services" className="text-sm font-medium text-white/90 hover:bg-white/10 rounded-full px-4 py-2 transition-all">
              Services
            </a>
            <a href="/contact" className="text-sm font-medium text-white/90 hover:bg-white/10 rounded-full px-4 py-2 transition-all">
              Contact Us
            </a>
            <a href="/about" className="text-sm font-medium text-white/90 hover:bg-white/10 rounded-full px-4 py-2 transition-all">
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-all text-white"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            
            <Button className="bg-white hover:bg-white/90 text-[hsl(220,50%,20%)] rounded-full px-8 py-2 hover:scale-105 transition-all font-medium">
              Join Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
