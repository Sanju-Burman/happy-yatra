import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "@/api.jsx";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import ActionButton from "@/components/ActionButton.jsx";

const ResetPassword = () => {
  const MotionDiv = motion.div;
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Password reset token is missing from the link");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      toast.success("Password reset successfully! Please login with your new password.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="reset-password-page"
      className="min-h-screen flex items-center justify-center px-6 py-20"
    >
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(180,89,63,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 border border-border">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2 tracking-tight">
            New Password
          </h1>
          <p className="text-muted-foreground mb-8">
            Create a secure new password for your account
          </p>

          {!token ? (
            <div className="space-y-6 text-center">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                Invalid reset link. The token is missing. Please request a new link.
              </div>
              <ActionButton to="/forgot-password" fullWidth>
                Request New Link
              </ActionButton>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              data-testid="reset-password-form"
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    data-testid="reset-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-background border border-border rounded-lg pl-11 pr-12 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-muted-foreground/50"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    data-testid="reset-confirm-password-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-lg pl-11 pr-12 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-muted-foreground/50"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-5 h-5" />
                </div>
              </div>

              <ActionButton
                type="submit"
                data-testid="reset-submit-button"
                disabled={loading}
                fullWidth
              >
                {loading ? "Resetting password..." : "Reset Password"}
              </ActionButton>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-primary hover:opacity-80 font-medium text-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default ResetPassword;
