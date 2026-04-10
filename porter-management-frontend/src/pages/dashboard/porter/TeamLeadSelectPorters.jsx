/**
 * @file TeamLeadSelectPorters.jsx
 * @description Legacy page — in the new flow, the team owner forwards
 *              bookings to ALL team members automatically.
 *              This page now redirects to the team owner dashboard.
 */

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TeamLeadSelectPorters = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate("/dashboard/porters/team-owner", { replace: true });
  }, [navigate]);

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <p className="text-gray-500 font-medium">
        Redirecting to Team Owner Dashboard…
      </p>
    </div>
  );
};

export default TeamLeadSelectPorters;
