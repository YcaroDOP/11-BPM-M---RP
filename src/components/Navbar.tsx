import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/utils/auth";
import { MoonIcon, SunIcon, LogOut, Settings } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!currentUser) {
    return null;
  }

  const routes = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Registro de Membros", path: "/register" },
    { name: "Planilha", path: "/spreadsheet" },
    { name: "Configurações", path: "/settings" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Sistema de Registro</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === route.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>

          <Link to="/settings">
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;