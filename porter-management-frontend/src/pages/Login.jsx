import { useState } from "react";
import { useLogin } from "../apis/hooks/authHooks";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const navigate = useNavigate();

  const { mutateAsync: login, isPending: loginLoading } = useLogin();
  
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.password) {
      toast.error("Phone and password are required.");
      return;
    }

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              phone
            </Label>
            <Input
              type="phone"
              name="phone"
              placeholder="Enter your phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </Label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-3 font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            {loginLoading ? "Proceeding.." : "Login"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Forgot your password?{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Reset
          </span>
        </p>

        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}
