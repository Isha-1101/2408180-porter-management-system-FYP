import Dashboard from "../pages/Dashboard";

const ProtectedRoute = () => {
  const isLoggedIn = localStorage.getItem("access_token");
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <main className="min-h-screen px-10 py-8">
      <Routes>
        <Route index element={<Dashboard />} />
      </Routes>
    </main>
  );
};

export default ProtectedRoute;
