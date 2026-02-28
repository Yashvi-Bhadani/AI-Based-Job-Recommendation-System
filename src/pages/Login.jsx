import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.message === "Login successful") {
        // Store user data
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");

        // Role-based redirect
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.log(err);
      setError("Server error");
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
          Find your perfect career match with AI-powered recommendations tailored
          specifically for students.
        </p>

        <ul className="space-y-3 mb-8">
          <li className="flex items-center gap-2">
            <span className="text-green-300">✔</span>
            Personalized job recommendations
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-300">✔</span>
            AI-powered career matching
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-300">✔</span>
            Track your application progress
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-300">✔</span>
            Connect with top employers
          </li>
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
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-6">
            Login to access your personalized job recommendations
          </p>

          {/* Email */}
          <label className="text-sm font-medium">Email Address</label>
          <input
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1 mb-4"
          />

          {/* Password */}
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1 mb-2"
          />

          {/* Error */}
          {error && (
            <p className="text-red-600 text-sm mb-3">{error}</p>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>

          {/* Register */}
          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 font-semibold">
              Register here
            </Link>
          </p>

          {/* Back to Home */}
          <div className="mt-3 text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-blue-600 underline"
            >
              ← Back to Home
            </Link>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}