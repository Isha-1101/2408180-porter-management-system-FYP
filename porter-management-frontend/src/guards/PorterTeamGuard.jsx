import { Navigate } from "react-router";
import { usePorter } from "../hooks/porter/use-porter";

const PorterTeamGuard = ({ children }) => {
  const { porter } = usePorter();
  const isPorterATeamOwner = porter?.porterType === "team";
  if (!isPorterATeamOwner) {
    return <Navigate to="/dashboard/porters" replace />;
  }
  return children;
};

export default PorterTeamGuard;
