import { Navigate } from "react-router";
import { usePorter } from "../hooks/porter/use-porter";

const PorterTeamGuard = ({ children }) => {
  const { porterData } = usePorter();
  const isPorterATeamOwner = porterData?.data?.porter[0]?.porterType === "team";
  if (!isPorterATeamOwner) {
    return <Navigate to="/dashboard/porters" replace />;
  }
  return children;
};

export default PorterTeamGuard;
