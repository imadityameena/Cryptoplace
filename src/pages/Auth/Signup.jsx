import { useContext, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import PasswordInput from "../../components/PasswordInput/PasswordInput";
import usePageTitle from "../../hooks/usePageTitle";
import "./Auth.css";

const Signup = () => {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  usePageTitle("Sign up");

  if (user) return <Navigate to={redirectTo} replace />;

  const changeHandler = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="auth-subtitle">Build a watchlist, track a portfolio and set price alerts.</p>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={submitHandler}>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              maxLength={50}
              value={form.name}
              onChange={changeHandler}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={changeHandler}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              value={form.password}
              onChange={changeHandler}
              required
            />
            <span className="form-hint">At least 8 characters, with a letter and a number.</span>
          </div>
          <div className="form-field">
            <label htmlFor="confirm">Confirm password</label>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              value={form.confirm}
              onChange={changeHandler}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
