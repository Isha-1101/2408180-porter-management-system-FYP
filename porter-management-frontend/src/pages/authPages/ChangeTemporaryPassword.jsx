import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowRight, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import Logo from "../../components/common/Logo";
import { useChangeTemporaryPassword } from "../../apis/hooks/useChangeTemporaryPassword";
import { useAuthStore } from "../../store/auth.store";

export default function ChangeTemporaryPassword() {
  const navigate = useNavigate();
  const { mutateAsync: changePassword, isPending } =
    useChangeTemporaryPassword();
  const logout = useAuthStore((state) => state.logout);

  const [togglePassword, setTogglePassword] = useState(false);
  const [toggleConfirm, setToggleConfirm] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error("Both fields are required.");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await changePassword({ newPassword: formData.newPassword });
      // Force logout and prompt them to re-login with the new password
      logout();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col justify-center p-8 relative"
        >
          <div className="flex flex-col items-center h-full w-full bg-background p-8 rounded-[40px] shadow-2xl border border-white/20">
            <Logo
              containerClassName="flex-col gap-2 justify-center"
              isColored
            />
            <div className="mt-8 text-center space-y-4">
              <h1 className="text-4xl font-bold text-primary">Secure Your Account</h1>
              <p className="text-gray-500 max-w-sm mx-auto">
                You are logging in with a temporary password provided by your team lead or admin. Please change it to a permanent one to continue.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center items-center"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="text-center pt-8 pb-4 px-8">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="mb-2 flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-orange-100 text-primary rounded-full flex items-center justify-center mb-4">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Update Password
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Create a new password for your account
                </p>
              </motion.div>
            </div>

            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={togglePassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 pr-12 h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setTogglePassword((prev) => !prev)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {togglePassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={toggleConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pl-10 pr-12 h-12 rounded-lg border-gray-200 focus:border-primary focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setToggleConfirm((prev) => !prev)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {toggleConfirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-md transition-all duration-300"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Update Password
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </motion.div>
                
                <div className="text-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-gray-500 hover:text-gray-900"
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                  >
                    Logout instead
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
