// src/pages/Auth/Login.tsx
import { useState } from "react";
import { useNavigate, NavLink } from "react-router";
import { Chrome, Github } from "lucide-react";

import SubmitBtn from "../../../shared/button/SubmitBtn";
import TextField from "../../../shared/TextField";
import { useAuth } from "../../../Routes/Route";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const areAllFieldsFilled = Object.values(formData).every((value) => value.trim() !== "");
  const isDisabled = isLoading || !areAllFieldsFilled;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: rawName, value } = e.target;
    const name = rawName as keyof typeof formData;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setErrors((prev) => ({ ...prev, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/users?email=${formData.email}`);
      const users = await response.json();

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      if (users.length === 0 || users[0].password !== formData.password) {
        setErrors({ general: "Invalid email or password" });
        setIsLoading(false);
        return;
      }

      login(users[0]);
      navigate("/dashboard");
      setFormData({ email: "", password: "" });
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: "Failed to log in. Please check if the server is running and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[rgb(75,119,212)] flex justify-center items-center p-4">
      <div className="flex bg-white rounded-2xl overflow-hidden max-w-6xl w-full p-1.5 shadow-2xl">
        {/* LEFT: Backdrop Image — Hidden on mobile, visible on md+ */}
        <div
          className="hidden md:block h-[660px] w-[600px] bg-[url('/Backdrop.jpg')] bg-center bg-cover bg-no-repeat
                     [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] flex-shrink-0 rounded-2xl"
          aria-hidden="true"
        />

        {/* RIGHT: Form — Full width on mobile, fixed on desktop */}
        <form
          onSubmit={handleSubmit}
          className="h-[660px] w-full md:w-[500px] flex flex-col justify-center items-center gap-3 py-4 px-6 md:px-10"
        >
          {/* Logo + Title */}
          <div className="flex gap-1.5 mb-2">
            <img src="/logo_3.png" alt="Quiz Bay Logo" className="h-[90px]" />
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-800 flex items-center">
              Quiz Bay
            </h1>
          </div>

          <h1 className="text-[25px] tracking-tight font-extrabold text-gray-800">
            Log in to your account
          </h1>

          {/* OAuth Buttons */}
          <div className="flex gap-8 mb-2 justify-center">
            <span className="p-2 border flex justify-center items-center rounded cursor-pointer hover:bg-gray-50 transition">
              <Github size={20} className="inline-block mr-2 text-gray-700" />
              <p className="font-bold text-[12px]">
                Log in with <span className="text-green-800">GitHub</span>
              </p>
            </span>
            <span className="p-2 border flex justify-center items-center rounded cursor-pointer hover:bg-gray-50 transition">
              <Chrome size={20} className="inline-block mr-2 text-gray-700" />
              <p className="font-bold text-[12px]">
                Log in with <span className="text-green-800">Google</span>
              </p>
            </span>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="text-red-600 text-sm text-center w-full max-w-xs">
              {errors.general}
            </div>
          )}

          {/* Form Fields */}
          <TextField
            label="Email"
            placeholder="Enter Your Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
          />

          <TextField
            label="Password"
            placeholder="Enter Your Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
          />

          <NavLink to="/signup">
            <p className="text-sm">
              Don't have an account? <span className="text-blue-600 font-semibold">Sign up</span>
            </p>
          </NavLink>

          <SubmitBtn
            label="Log In"
            isDisabled={isDisabled}
            isLoading={isLoading}
          />
        </form>
      </div>
    </div>
  );
}

export default Login;