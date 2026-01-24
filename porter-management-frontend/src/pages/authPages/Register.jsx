// import { useState } from "react";
// import { Button } from "@/components/ui/button.jsx";
// import { Input } from "@/components/ui/input.jsx";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card.jsx";
// import { useRegister } from "../../apis/hooks/authHooks";
// import { toast } from "react-hot-toast";
// import { Link, useNavigate } from "react-router";
// import { Eye, EyeOff } from "lucide-react";
// const Register = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     role: "user",
//   });
//   const [togglePassword, setTogglePassword] = useState(false);
//   const changeHandler = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const { mutateAsync: register, isPending: registerPending } = useRegister();

//   const submitHandler = async (e) => {
//     e.preventDefault();
//     if (
//       !form.name ||
//       !form.email ||
//       !form.phone ||
//       !form.password ||
//       !form.role
//     ) {
//       toast.error("All fields are required");
//       return;
//     }
//     try {
//       await register(form);
//       navigate("/login");

//       setForm({
//         name: "",
//         email: "",
//         phone: "",
//         password: "",
//         role: "user",
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <div className="flex h-screen w-full ">
//       {/* LEFT SIDE IMAGE */}
//       <div className="hidden md:block w-1/2 h-full bg-[url('/images/Logo.png')] bg-cover bg-center border border-gray-300">
//         this is left side
//       </div>

//       {/* RIGHT SIDE FORM */}
//       <div className="flex justify-center items-center w-full md:w-1/2 px-4">
//         <Card className="w-[400px] rounded-lg shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-center text-2xl text-primary font-semibold">
//               Register
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={submitHandler} className="space-y-4">
//               <div className="mb-6">
//                 <Label>Name</Label>
//                 <Input
//                   name="name"
//                   value={form.name}
//                   onChange={changeHandler}
//                   placeholder="Enter name"
//                 />
//               </div>

//               <div className="mb-6">
//                 <Label>Email</Label>
//                 <Input
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   onChange={changeHandler}
//                   placeholder="Enter email"
//                 />
//               </div>

//               <div className="mb-6">
//                 <Label>Phone</Label>
//                 <Input
//                   name="phone"
//                   value={form.phone}
//                   onChange={changeHandler}
//                   placeholder="98XXXXXXXX"
//                 />
//               </div>

//               <div className="mb-6 relative">
//                 <Label>Password</Label>
//                 <Input
//                   type={togglePassword ? "text" : "password"}
//                   name="password"
//                   value={form.password}
//                   onChange={changeHandler}
//                   placeholder="Enter password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setTogglePassword((prev) => !prev)}
//                   className="absolute right-3 top-6 text-gray-600 hover:text-gray-800 cursor-pointer"
//                 >
//                   {togglePassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>

//               <div className="mb-6">
//                 <Label>Role</Label>
//                 <select
//                   name="role"
//                   value={form.role}
//                   onChange={changeHandler}
//                   className="border rounded-md w-full p-2"
//                 >
//                   <option value="user">User</option>
//                   <option value="porter">Porter</option>
//                 </select>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full cursor-pointer"
//                 variant={"default"}
//               >
//                 {registerPending ? "Registering..." : "Register"}
//               </Button>
//             </form>
//           </CardContent>
//           <CardFooter className="flex flex-col items-center">
//             <p className="mt-2 text-center text-sm text-gray-600">
//               Already have an account?{" "}
//               <span
//                 className="text-primary cursor-pointer hover:underline"
//                 onClick={() => navigate("/login")}
//               >
//                 Login
//               </span>
//             </p>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Register;

import { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card.jsx";
import { useRegister } from "../../apis/hooks/authHooks";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
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
    role: "user",
  });
  const [togglePassword, setTogglePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { mutateAsync: register, isPending: registerPending } = useRegister();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.role
    ) {
      toast.error("All fields are required");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      setIsLoading(false);
      return;
    }

    // Password validation
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      await register(form);
      toast.success("Account created successfully! Please login.");
      navigate("/login");

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Book porters instantly",
    "Track deliveries in real-time",
    "Manage multiple porters",
    "Secure payment options",
    "24/7 customer support",
    "Detailed analytics dashboard",
  ];

  return (
    <div className="min-h-screen bg-[#FFFEE9] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full flex justify-center z-10">
        {/* Left Side - Benefits */}


        {/* Right Side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center items-center"
        >
          <Card className="w-full max-w-2xl border-0 rounded-2xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pt-8 pb-4">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="mb-2"
              >
                <CardTitle className="text-3xl font-bold text-primary">
                  Create Account
                </CardTitle>
              </motion.div>
            </CardHeader>

            <CardContent className="pb-6">
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
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={changeHandler}
                      placeholder="Name Lastname"
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
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
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={changeHandler}
                      placeholder="name@herald.com"
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
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
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={changeHandler}
                      placeholder="98XXXXXXXX"
                      maxLength="10"
                      className="pl-10 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
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
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={togglePassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={changeHandler}
                      placeholder="••••••••"
                      className="pl-10 pr-12 h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
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
                      onClick={() => setForm({ ...form, role: "user" })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${form.role === "user"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 hover:border-primary/30 hover:bg-primary/5"
                        }`}
                    >
                      <User className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">User</div>
                      <div className="text-xs text-gray-500">Book porters</div>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => setForm({ ...form, role: "porter" })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${form.role === "porter"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-200 hover:border-primary/30 hover:bg-primary/5"
                        }`}
                    >
                      <Building className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Porter</div>
                      <div className="text-xs text-gray-500">
                        Offer services
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 cursor-pointer bg-primary hover:bg-primary/90 text-white"
                    disabled={registerPending || isLoading}
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
            </CardContent>

            <CardFooter className="flex flex-col items-center">
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">Already have an account?</span>
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-primary hover:text-primary/80 font-semibold p-0"
                >
                  Sign In
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Register;
