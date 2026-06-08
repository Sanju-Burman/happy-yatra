import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/api.jsx";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ActionButton from "@/components/ActionButton.jsx";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const MotionDiv = motion.div;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="forgot-password-page"
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
            Reset Password
          </h1>
          <p className="text-muted-foreground mb-8">
            {submitted
              ? "Check your inbox for a link to reset your password."
              : "Enter your email address to receive a password reset link."}
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              data-testid="forgot-password-form"
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    data-testid="forgot-password-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-lg pl-11 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-muted-foreground/50"
                    placeholder="your@email.com"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-5 h-5" />
                </div>
              </div>

              <ActionButton
                type="submit"
                data-testid="forgot-password-submit-button"
                disabled={loading}
                fullWidth
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </ActionButton>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center mx-auto text-primary">
                <Mail className="w-8 h-8" />
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset email to <strong>{email}</strong>. The link will expire in 15 minutes.
              </p>
              <ActionButton
                variant="secondary"
                onClick={() => setSubmitted(false)}
                fullWidth
              >
                Resend Link
              </ActionButton>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              data-testid="forgot-password-login-link"
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

export default ForgotPassword;
