import { useLocation } from "react-router";
import { useState } from "react";
import api from "../api.js"; // make sure path is correct

export default function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Assuming your API has this endpoint:
      const res = await api.resendVerificationEmail({ email });
      setMessage(
        res.message ||
          "Verification email resent. Please check your inbox and spam."
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <h2>Verify your email</h2>
        <p>
          We’ve sent a verification link to your email{" "}
          {email ? <strong>{email}</strong> : "your email address"}.
          <br />
          Please check your inbox and <strong>spam/junk folder</strong>.
        </p>

        <button
          onClick={handleResend}
          disabled={loading}
          className="resend-button"
        >
          {loading ? "Resending..." : "Resend verification email"}
        </button>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <br />
        <a href="/">Go to Home</a>
      </div>
    </div>
  );
}
