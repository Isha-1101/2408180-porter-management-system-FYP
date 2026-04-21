import { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
} from "@/components/ui/card.jsx";
import { useRegister } from "../../apis/hooks/authHooks";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Building,
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../../components/common/Logo";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    role: false,
  });
  const [togglePassword, setTogglePassword] = useState(false);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const errors = {
    name: !form.name
      ? "Only letters allowed, minimum 2 characters"
      : /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(form.name) && form.name.length >= 2
      ? ""
      : "Only letters allowed, minimum 2 characters",
    email: !form.email
      ? "Enter a valid email address"
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && !/\s/.test(form.email)
      ? ""
      : "Enter a valid email address",
    phone: !form.phone
      ? "Enter a valid 10-digit phone number"
      : /^\d{10}$/.test(form.phone)
      ? ""
      : "Enter a valid 10-digit phone number",
    password: !form.password
      ? "Password must include uppercase, lowercase, and a number"
      : /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(form.password)
      ? ""
      : "Password must include uppercase, lowercase, and a number",
    confirmPassword: !form.confirmPassword
      ? "Please confirm your password"
      : form.password === form.confirmPassword
      ? ""
      : "Passwords do not match",
    role: form.role === "user" || form.role === "porter" ? "" : "Please select a role",
  };

  const isFormValid = Object.values(errors).every((err) => err === "");

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setTouched({ ...touched, [e.target.name]: true });
  };

  const blurHandler = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const { mutateAsync: register, isPending: registerPending } = useRegister();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      };
      await register(payload);
      toast.success("Account created successfully! Please login.");
      navigate("/login");

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
      setTouched({
        name: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false,
        role: false,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FBF2] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Back Arrow Button */}
      <button
        onClick={() => navigate("/")}
        type="button"
        className="absolute top-8 left-8 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-[#C5E2B6] group z-50"
        title="Back to landing page"
      >
        <ArrowLeft className="w-6 h-6 text-[#0C4C40] group-hover:text-[#8DC976] transition-colors" />
      </button>

      <div className="w-full flex justify-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center items-center"
        >
          <Card className="min-w-2xl w-full border-0 rounded-2xl shadow-2xl overflow-hidden bg-white/80 ">
            <CardHeader className="text-center pt-8 pb-4">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="mb-2 flex flex-col items-center"
              >
                <Logo
                  containerClassName="flex justify-center items-center"
                  logoClassName="w-28 h-28"
                  isColored
                />
                <h1 className="text-2xl font-bold text-center text-[#0C4C40]">
                  DOKO Namlo
                </h1>
                <h2 className="text-lg font-medium text-center text-gray-600 mt-2">
                  Create Account to Get Started !
                </h2>
              </motion.div>
            </CardHeader>

            <div className="px-8 pb-8">
              <form onSubmit={submitHandler} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-[#0C4C40]" />
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={changeHandler}
                      onBlur={blurHandler}
                      placeholder="Enter your full name"
                      className={`pl-10 h-12 pr-10 rounded-lg transition-colors hover:bg-[#F5FBF2] ${
                        touched.name && errors.name
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-[#C5E2B6] hover:border-[#8DC976] focus:border-[#0C4C40] focus:ring-[#0C4C40]"
                      }`}
                    />
                  </div>
                  {touched.name && errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-[#0C4C40]" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={changeHandler}
                      onBlur={blurHandler}
                      placeholder="Enter your email address"
                      className={`pl-10 h-12 pr-10 rounded-lg transition-colors hover:bg-[#F5FBF2] ${
                        touched.email && errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-[#C5E2B6] hover:border-[#8DC976] focus:border-[#0C4C40] focus:ring-[#0C4C40]"
                      }`}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-[#0C4C40]" />
                    <Input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={changeHandler}
                      onBlur={blurHandler}
                      placeholder="Enter your phone number"
                      maxLength="10"
                      className={`pl-10 h-12 pr-10 rounded-lg transition-colors hover:bg-[#F5FBF2] ${
                        touched.phone && errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-[#C5E2B6] hover:border-[#8DC976] focus:border-[#0C4C40] focus:ring-[#0C4C40]"
                      }`}
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-[#0C4C40]" />
                    <Input
                      id="password"
                      type={togglePassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={changeHandler}
                      onBlur={blurHandler}
                      placeholder="Enter your password"
                      className={`pl-10 pr-12 h-12 rounded-lg transition-colors hover:bg-[#F5FBF2] ${
                        touched.password && errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-[#C5E2B6] hover:border-[#8DC976] focus:border-[#0C4C40] focus:ring-[#0C4C40]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setTogglePassword((prev) => !prev)}
                      className="absolute right-3 top-3.5 text-[#0C4C40] hover:text-gray-600 transition-colors"
                    >
                      {togglePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.password && errors.password ? (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Minimum 8 characters, include uppercase, lowercase, and a number
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-[#0C4C40]" />
                    <Input
                      id="confirmPassword"
                      type={toggleConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={changeHandler}
                      onBlur={blurHandler}
                      placeholder="Confirm your password"
                      className={`pl-10 pr-12 h-12 rounded-lg transition-colors hover:bg-[#F5FBF2] ${
                        touched.confirmPassword && errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-[#C5E2B6] hover:border-[#8DC976] focus:border-[#0C4C40] focus:ring-[#0C4C40]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setToggleConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-3.5 text-[#0C4C40] hover:text-gray-600 transition-colors"
                    >
                      {toggleConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700"
                  >
                    I want to register as
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, role: "user" });
                        setTouched({ ...touched, role: true });
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        form.role === "user"
                          ? "border-[#0C4C40] bg-[#C5E2B6] text-[#0C4C40]"
                          : "border-[#C5E2B6] hover:border-[#8DC976] hover:bg-[#F5FBF2] text-gray-600"
                      }`}
                    >
                      <User className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">User</div>
                      <div className="text-xs text-gray-500">Book porters</div>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, role: "porter" });
                        setTouched({ ...touched, role: true });
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        form.role === "porter"
                          ? "border-[#0C4C40] bg-[#C5E2B6] text-[#0C4C40]"
                          : "border-[#C5E2B6] hover:border-[#8DC976] hover:bg-[#F5FBF2] text-gray-600"
                      }`}
                    >
                      <Building className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Porter</div>
                      <div className="text-xs text-gray-500">Offer services</div>
                    </motion.button>
                  </div>
                  {touched.role && errors.role && (
                    <p className="text-xs text-red-500">{errors.role}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className={`w-full h-12 transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl ${
                      isFormValid
                        ? "bg-[#C5E2B6] hover:bg-[#8DC976] text-[#0C4C40] cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed border-none shadow-none"
                    }`}
                    disabled={registerPending || isLoading || !isFormValid}
                  >
                    {registerPending || isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Create Account
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>

            <div className="pb-8 text-center bg-transparent">
              <div className="flex justify-center items-center space-x-1">
                <span className="text-gray-600">Already have an account?</span>
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-[#0C4C40] hover:text-[#8DC976] font-semibold p-0"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

