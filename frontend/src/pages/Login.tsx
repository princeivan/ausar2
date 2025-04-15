import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import api from "../../api";
import { jwtDecode } from "jwt-decode";

interface jwtPayload {
  is_admin: boolean;
  user_id: string;
}
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      // Redirect to home page if already logged in
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/token/", { email, password });

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;
      localStorage.setItem(ACCESS_TOKEN, accessToken);
      localStorage.setItem(REFRESH_TOKEN, refreshToken);

      const decoded = jwtDecode<jwtPayload>(accessToken);

      if (decoded.is_admin) {
        const userInfo = { email, role: "admin" };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        toast.success("Logged in successfully as admin");
        navigate("/");
      } else {
        const userInfo = { email, role: "user" };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        toast.success("Logged in successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error(
        "Failed to login. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-brand-blue hover:text-brand-darkBlue"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand-blue hover:text-brand-darkBlue"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center">
              <Checkbox id="remember-me" />
              <Label
                htmlFor="remember-me"
                className="ml-2 text-sm cursor-pointer"
              >
                Remember me
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          {/* <div className="text-center text-sm">
            <p className="mt-2 text-gray-600">
              Demo accounts: <br />
              <span className="font-medium">Admin:</span> admin@example.com /
              password <br />
              <span className="font-medium">User:</span> user@example.com /
              password
            </p>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default Login;
