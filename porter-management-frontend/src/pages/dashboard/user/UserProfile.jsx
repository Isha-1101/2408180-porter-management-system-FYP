import { User, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/common/PageLayout";
import { useAuthStore } from "@/store/auth.store";

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="p-2 bg-primary/8 rounded-lg text-primary mt-0.5 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-900 font-medium mt-0.5 wrap-break-word">
        {value || "—"}
      </p>
    </div>
  </div>
);

const UserProfile = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">
            User not found
          </h2>
        </div>
      </PageLayout>
    );
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageLayout>
      <div className="max-w-full mx-auto px-4 py-6 space-y-6">
        {/* ── Hero Banner ── */}
        <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-[#1A3C3B] to-[#2E6B5E] text-white p-6 shadow-md">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,white,transparent)]" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shrink-0">
              <span className="text-3xl font-bold text-white">
                {initials || "U"}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold capitalize truncate">
                {user?.name || "User"}
              </h1>
              <p className="text-sm text-white/70 mt-0.5">{user?.email}</p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/15 border border-white/20 capitalize">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.role || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Account Details ── */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow
              icon={<User className="w-4 h-4" />}
              label="Full Name"
              value={user?.name}
            />
            <InfoRow
              icon={<Mail className="w-4 h-4" />}
              label="Email Address"
              value={user?.email}
            />
            <InfoRow
              icon={<Shield className="w-4 h-4" />}
              label="Role"
              value={
                user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : undefined
              }
            />
          </CardContent>
        </Card>

      </div>
    </PageLayout>
  );
};

export default UserProfile;
