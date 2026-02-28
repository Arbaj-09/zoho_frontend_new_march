"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { backendApi } from "@/services/api";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [orgError, setOrgError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");

    if (token && role) {
      router.replace(
        role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard"
      );
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation with specific error messages
    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    setOrgError("");
    
    if (!email) {
      setEmailError("Email is required");
      toast.error("Email is required");
      return;
    }
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email");
      toast.error("Please enter a valid email");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      toast.error("Password is required");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!organization) {
      setOrgError("Organization is required");
      toast.error("Organization is required");
      return;
    }

    setLoading(true);
    try {
      const data = await backendApi.post("/auth/login", {
        email: email.trim(),
        password,
        organization: organization.trim(),
      });

      console.log("Login response:", data);

      // Success case with proper validation
      if (data?.token && data?.role) {
        // Store user data
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_role", data.role);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        localStorage.setItem("employee_id", data.employeeId);

        // Success notification with user name
        const userName = data.user?.firstName || data.user?.fullName || "User";
        toast.success(`Welcome ${userName}!`);
        
        // Role-based redirect
        if (data.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/employee/dashboard");
        }
      } else {
        // Specific error handling
        const errorMessage = data?.error || data?.message || "Login failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Detailed error handling
      let errorMessage = "Login failed. Please try again.";
      
      if (error?.message) {
        if (error.message.includes("Network Error") || error.message.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("400")) {
          errorMessage = "Invalid email or password.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <div className="text-2xl font-bold text-slate-800">Y</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-lg">
            Attendance Management System
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/90 rounded-3xl shadow-2xl p-8 border border-slate-600"
        >
          <div className="space-y-6">
            {/* Organization Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Organization
              </label>
              <select
                className={`w-full appearance-none bg-slate-700 border rounded-xl px-4 py-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${orgError ? "border-red-500 bg-red-500/10" : "border-slate-600"}`}
                value={organization}
                onChange={(e) => {
                  setOrganization(e.target.value);
                  setOrgError("");
                }}
              >
                <option value="" disabled className="text-slate-400 bg-slate-800">
                  Select organization
                </option>
                <option value="Yash Enterprises" className="bg-slate-800 text-white">
                  Yash Enterprises
                </option>
              </select>
              {orgError && <p className="text-red-400 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {orgError}
              </p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`peer w-full bg-slate-700 border rounded-xl px-4 py-4 pl-12 text-white font-medium tracking-wide placeholder:text-slate-400 focus:text-white focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.5)] transition-all duration-200 ${emailError ? "border-red-500 bg-red-500/10" : "border-slate-600"}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-blue-400">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l9 6 9-6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8" />
                  </svg>
                </div>
              </div>
              {emailError && <p className="text-red-400 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {emailError}
              </p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  className={`peer w-full bg-slate-700 border rounded-xl px-4 py-4 pl-12 text-white font-medium tracking-wide placeholder:text-slate-400 focus:text-white focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.5)] transition-all duration-200 ${passwordError ? "border-red-500 bg-red-500/10" : "border-slate-600"}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-blue-400">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              {passwordError && <p className="text-red-400 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {passwordError}
              </p>}
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl py-4 font-semibold text-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0114 12h4v4a8 8 0 01-8 8v-4z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Need help?{' '}
              <button type="button" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Contact Support
              </button>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 Yash Enterprises. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
