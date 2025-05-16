import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import api from "../../api";

// Validation functions
const validateUsername = (username: string): boolean => {
  // Username should be 3-20 characters, alphanumeric with underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validatePhone = (phone: string): boolean => {
  // Phone number should be 10 digits
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const Register = () => {
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [username, setUsername] = useState("");
  const [phone_number, setPhone_Number] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirm_Password] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      // Redirect to home page if already logged in
      navigate("/");
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (!validateUsername(username)) {
      newErrors.username = "Username must be 3-20 characters and can only contain letters, numbers, and underscores";
    }

    if (!phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!validatePhone(phone_number)) {
      newErrors.phone_number = "Please enter a valid 10-digit phone number";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character";
    }

    if (!confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (password !== confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/user/register/", {
        first_name,
        last_name,
        username,
        email,
        phone_number,
        password,
        confirm_password,
      });
      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);
      localStorage.setItem("userInfo", JSON.stringify(res.data.user));
      toast.success("Account created successfully");
      navigate("/");
    } catch (error: any) {
      if (error.response?.data) {
        // Handle specific error messages from the backend
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          Object.entries(errorData).forEach(([key, value]) => {
            toast.error(`${key}: ${value}`);
          });
        } else {
          toast.error(errorData);
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-brand-blue hover:text-brand-darkBlue"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="FirstName">First Name</Label>
              <Input
                id="FirstName"
                type="text"
                placeholder="John"
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                className={errors.first_name ? "border-red-500" : ""}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="LastName">Last Name</Label>
              <Input
                id="LastName"
                type="text"
                placeholder="Doe"
                value={last_name}
                onChange={(e) => setLast_name(e.target.value)}
                className={errors.last_name ? "border-red-500" : ""}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="Username">Username</Label>
              <Input
                id="Username"
                type="text"
                placeholder="JohnDoe2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678"
                value={phone_number}
                onChange={(e) => setPhone_Number(e.target.value)}
                className={errors.phone_number ? "border-red-500" : ""}
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirm_password}
                onChange={(e) => setConfirm_Password(e.target.value)}
                className={errors.confirm_password ? "border-red-500" : ""}
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
              )}
            </div>

            <div className="flex items-center">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className={errors.terms ? "border-red-500" : ""}
              />
              <Label
                htmlFor="accept-terms"
                className="ml-2 text-sm cursor-pointer"
              >
                I accept the
                <Link
                  to="/terms"
                  className="text-brand-blue hover:text-brand-darkBlue"
                >
                  Terms of Service
                </Link>
                and
                <Link
                  to="/privacy"
                  className="text-brand-blue hover:text-brand-darkBlue"
                >
                  Privacy Policy
                </Link>
              </Label>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
