// src/pages/Auth/Signup.tsx
import { Chrome, Github, X } from "lucide-react";
import SubmitBtn from "../../../shared/button/SubmitBtn";
import TextField from "../../../shared/TextField";
import { useState } from "react";
import type { ValidationErrors } from "../lib/type";
import { validateSignup } from "../hooks/ValidateSignup";
import { useAuth } from "../../../Routes/Route";
import { NavLink, useNavigate } from "react-router";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const areAllFieldsFilled = Object.values(formData).every(
    (value) => (value ?? "").toString().trim() !== ""
  );
  const isDisabled = isLoading || !areAllFieldsFilled;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name as keyof ValidationErrors]: undefined }));
  };

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateSignup(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);

    try {
      const checkRes = await fetch(
        `http://localhost:3000/users?email=${encodeURIComponent(formData.email.trim())}`
      );
      const existing = await checkRes.json();

      if (existing.length > 0) {
        setShowEmailExistsModal(true);
        setIsLoading(false);
        return;
      }

      const userToStore = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        id: generateId(),
      };

      const createRes = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToStore),
      });

      if (!createRes.ok) throw new Error("Failed to create account");

      const savedUser = await createRes.json();
      login(savedUser);
      navigate("/dashboard");
    } catch (err) {
      setShowEmailExistsModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Full Responsive Container */}
      <div className="h-screen w-screen bg-[rgb(75,119,212)] flex justify-center items-center p-4">
        <div className="flex bg-white rounded-2xl p-1.5 overflow-hidden max-w-6xl w-full shadow-2xl">
          {/* LEFT: Backdrop Image — Hidden on mobile, shown on md+ */}
          <div
            className="hidden md:block h-[660px] w-[600px] bg-[url('/Backdrop.jpg')] bg-center bg-cover bg-no-repeat 
                       [clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] flex-shrink-0 rounded-2xl"
            aria-hidden="true"
          />

          {/* RIGHT: Form — Full width on mobile */}
          <form
            onSubmit={handleSubmit}
            className="h-[660px] w-full md:w-[500px] flex flex-col gap-3 justify-center items-center py-4 px-6 md:px-10"
          >
            <div className="flex gap-0.5 mb-1 mt-1">
              <img src="/logo_3.png" alt="Quiz Bay Logo" className="h-[90px]" />
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-800 flex items-center">
                Quiz Bay
              </h1>
            </div>

            <h1 className="text-[25px] tracking-tight font-extrabold text-gray-800">
              Create your account
            </h1>

            <div className="flex gap-8 mb-2 justify-center">
              <span className="p-2 border flex justify-center items-center rounded cursor-pointer hover:bg-gray-50 transition">
                <Github size={20} className="inline-block mr-2 text-gray-700" />
                <p className="font-bold text-[12px]">
                  Sign up with <span className="text-green-800">GitHub</span>
                </p>
              </span>
              <span className="p-2 border flex justify-center items-center rounded cursor-pointer hover:bg-gray-50 transition">
                <Chrome size={20} className="inline-block mr-2 text-gray-700" />
                <p className="font-bold text-[12px]">
                  Sign up with <span className="text-green-800">Google</span>
                </p>
              </span>
            </div>

            <TextField
              label="Full Name"
              placeholder="Enter Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
            />

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

            <TextField
              label="Confirm Password"
              placeholder="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
            />
  
            <NavLink to="/login">
              <p className="text-sm">
                Already have an account? <span className="text-blue-600 font-semibold">Log in</span>
              </p>
            </NavLink>

            <SubmitBtn label="Sign Up" isDisabled={isDisabled} isLoading={isLoading} />
          </form>
        </div>
      </div>

      {/* Modal — Unchanged & Beautiful */}
      {showEmailExistsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Email Already Exists</h2>
              <button
                onClick={() => setShowEmailExistsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              The email <span className="font-semibold text-blue-600">{formData.email}</span> is already registered.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEmailExistsModal(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Try Another Email
              </button>
              <NavLink to="/login">
                <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Go to Login
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Signup;