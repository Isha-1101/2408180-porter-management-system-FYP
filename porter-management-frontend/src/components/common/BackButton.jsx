import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

/**
 * Back navigation button.
 * - If `to` is provided, navigates to that path.
 * - Otherwise calls navigate(-1) to go back.
 */
export function BackButton({ to, label = "Back", className = "" }) {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      className={`pl-0 hover:bg-transparent hover:text-primary ${className}`}
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
