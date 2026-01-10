"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { backendApi } from "@/services/api";
import { User, Lock, Mail, Smartphone, Building2, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState("email"); // "email" or "mobile"
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState("");

  // Mock organizations - in real app, this would come from API
  const organizations = [
    { id: 1, name: "Yash Enterprises" },
    { id: 2, name: "Branch Office" }
  ];

  useEffect(() => {
    // If already logged in, go to dashboard
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      const userRole = localStorage.getItem("user_role");
      if (token && userRole) {
        // Redirect based on role
        switch (userRole) {
          case "Admin":
            router.replace("/admin/dashboard");
            break;
          case "Manager":
            router.replace("/manager/dashboard");
            break;
          case "Employee":
            router.replace("/employee/dashboard");
            break;
          default:
            router.replace("/");
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = {
        organizationId: parseInt(selectedOrganization),
        password: password
      };

      // Add email or mobile based on login type
      if (loginType === "email") {
        loginData.email = email;
      } else {
        loginData.mobile = mobile;
      }

      // Call backend login API
      const response = await backendApi.post("/auth/login", loginData);
      
      if (response && response.token) {
        // Store authentication data
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", response.token);
          localStorage.setItem("user_role", response.user.roleName);
          localStorage.setItem("user_data", JSON.stringify(response.user));
        }

        toast.success(`Welcome back, ${response.user.name || response.user.email}!`);

        // Redirect based on user role
        switch (response.user.roleName) {
          case "Admin":
            router.replace("/admin/dashboard");
            break;
          case "Manager":
            router.replace("/manager/dashboard");
            break;
          case "Employee":
            router.replace("/employee/dashboard");
            break;
          default:
            router.replace("/");
        }
      } else {
        setError("Invalid credentials");
        toast.error("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      toast.error("Login failed. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Yash Enterprises</h1>
          <p className="text-purple-100">Enterprise Resource Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Organization Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization
              </label>
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Login Type Toggle */}
            <div>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setLoginType("email")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loginType === "email"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Mail size={16} className="inline mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("mobile")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    loginType === "mobile"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Smartphone size={16} className="inline mr-2" />
                  Mobile
                </button>
              </div>
            </div>

            {/* Email/Mobile Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === "email" ? "Email Address" : "Mobile Number"}
              </label>
              <div className="relative">
                {loginType === "email" ? (
                  <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                ) : (
                  <Smartphone className="absolute left-3 top-3 text-gray-400" size={16} />
                )}
                <input
                  type={loginType === "email" ? "email" : "tel"}
                  placeholder={loginType === "email" ? "Enter your email" : "Enter your mobile number"}
                  value={loginType === "email" ? email : mobile}
                  onChange={(e) => loginType === "email" ? setEmail(e.target.value) : setMobile(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedOrganization}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <><User size={16} className="mr-2" />Sign In</>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-xs font-medium text-indigo-800 mb-2">Demo Credentials:</p>
            <div className="text-xs text-indigo-600 space-y-1">
              <p><strong>Admin:</strong> admin@yashenterprises.com / admin123</p>
              <p><strong>Manager:</strong> manager@yashenterprises.com / manager123</p>
              <p><strong>Employee:</strong> employee@yashenterprises.com / employee123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-100 text-sm">
            © 2026 Yash Enterprises. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
