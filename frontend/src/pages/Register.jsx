import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError("");

    if (!form.name || !form.email || !form.password || !form.role) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await response.json();

      if (data.message === "User registered successfully") {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SECTION */}
      <div className="w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex flex-col justify-center">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
          <span className="text-2xl">💼</span>
        </div>

        <h1 className="text-4xl font-bold mb-4">
          AI Job Recommendation System
        </h1>

        <p className="text-blue-100 mb-6 max-w-md">
          Join our AI-powered job recommendation platform built for students and admins.
        </p>

        <ul className="space-y-3 mb-8">
          <li>✔ Personalized job recommendations</li>
          <li>✔ AI-powered career matching</li>
          <li>✔ Track application progress</li>
          <li>✔ Connect with top employers</li>
        </ul>

        <div className="bg-white/10 p-4 rounded-xl w-72">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
            alt="career"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-2">Create Account</h2>
          <p className="text-gray-500 mb-6">
            Join our AI-powered job recommendation platform
          </p>

          <label className="text-sm font-medium">Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full border rounded px-3 py-2 mt-1 mb-3"
          />

          <label className="text-sm font-medium">Email Address</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="student@example.com"
            className="w-full border rounded px-3 py-2 mt-1 mb-3"
          />

          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            className="w-full border rounded px-3 py-2 mt-1 mb-3"
          />

          <label className="text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className="w-full border rounded px-3 py-2 mt-1 mb-3"
          />

          <label className="text-sm font-medium">Select Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1 mb-3"
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          {error && (
            <p className="text-red-600 text-sm mb-3">{error}</p>
          )}

          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Create Account →
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold">
              Login here
            </Link>
          </p>

          <p className="text-xs text-gray-400 text-center mt-4">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}