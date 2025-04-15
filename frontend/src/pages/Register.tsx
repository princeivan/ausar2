import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import api from "../../api";

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
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      // Redirect to home page if already logged in
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !first_name ||
      !last_name ||
      !username ||
      !phone_number ||
      !email ||
      !password ||
      !confirm_password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password !== confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
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
    } catch (error) {
      toast.error("Registration failed");
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
              <Label htmlFor="FirstName">FirstName</Label>
              <Input
                id="FirstName"
                type="text"
                placeholder="John"
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="LastName">LastName</Label>
              <Input
                id="LastName"
                type="text"
                placeholder="Doe"
                value={last_name}
                onChange={(e) => setLast_name(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="Username">UserName</Label>
              <Input
                id="Username"
                type="text"
                placeholder="JohnDOe2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone No.</Label>
              <Input
                id="phoe"
                type="number"
                placeholder="0712345678"
                value={phone_number}
                onChange={(e) => setPhone_Number(e.target.value)}
                required
              />
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
                required
              />
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
                required
              />
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
                required
              />
            </div>

            <div className="flex items-center">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
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
