import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Package,
  User,
  Briefcase,
  Shield,
  Mail,
  Lock,
  Phone,
  AlertCircle,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  };
  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg  overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 p-3 rounded-full">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-green-100 mt-2">Join our platform</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+977 98XXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3">
                  Register As
                </label>
                <div className=" border flex items-center justify-center gap-6 p-4 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "user" })}
                    className={`p-3 rounded-lg border-2 transition text-center ${
                      formData.role === "user"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <User className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "porter" })}
                    className={`p-3 rounded-lg border-2 transition text-center ${
                      formData.role === "porter"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Porter</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
