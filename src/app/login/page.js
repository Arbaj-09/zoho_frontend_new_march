"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { backendApi } from "@/services/api";
import { User, Lock, Mail, Smartphone, Building2, Eye, EyeOff } from "lucide-react";

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
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Company Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yash Enterprises</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <><User size={16} className="mr-2" />Sign In</>
              )}
            </button>
          </form>

          {/* Development Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Development Login:</strong><br />
              Admin: admin@yashenterprises.com / admin123<br />
              Manager: manager@yashenterprises.com / manager123<br />
              Employee: employee@yashenterprises.com / employee123
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>&copy; 2025 Yash Enterprises. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
