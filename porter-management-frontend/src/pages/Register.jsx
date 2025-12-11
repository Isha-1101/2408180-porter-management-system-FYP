import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const changeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );
      alert("User Registered Successfully");
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:block w-1/2 h-full">
        <img
          src="/images/Logo2_1.png"
          alt="Register illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex justify-center items-center w-full md:w-1/2 bg-gray-100 px-4">
        <Card className="w-[400px] shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={changeHandler}
                  placeholder="Enter name"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={changeHandler}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={changeHandler}
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={changeHandler}
                  placeholder="Enter password"
                />
              </div>

              <div>
                <Label>Role</Label>
                <select
                  name="role"
                  value={form.role}
                  onChange={changeHandler}
                  className="border rounded-md w-full p-2"
                >
                  <option value="user">User</option>
                  <option value="porter">Porter</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                variant={"default"}
              >
                Register
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;