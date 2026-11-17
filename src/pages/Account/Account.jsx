import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { AuthContext } from "../../context/AuthContext";
import { CoinContext } from "../../context/CoinContext";
import { CURRENCIES } from "../../constants";
import "../Auth/Auth.css";
import "../Watchlist/Watchlist.css";
import "../Portfolio/Portfolio.css";
import "./Account.css";

const useFormState = () => {
  const [status, setStatus] = useState({ error: "", success: "", saving: false });
  const run = async (action, successMessage) => {
    setStatus({ error: "", success: "", saving: true });
    try {
      await action();
      setStatus({ error: "", success: successMessage, saving: false });
      return true;
    } catch (err) {
      setStatus({ error: err.message, success: "", saving: false });
      return false;
    }
  };
  return [status, run];
};

const Account = () => {
  const { user, updateProfile, changePassword, logout } = useContext(AuthContext);
  const { setCurrency } = useContext(CoinContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user.name,
    preferredCurrency: CURRENCIES[user.preferredCurrency] ? user.preferredCurrency : "usd",
  });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [profileStatus, runProfile] = useFormState();
  const [passwordStatus, runPassword] = useFormState();
  const [deleteStatus, runDelete] = useFormState();

  const profileHandler = (event) => {
    event.preventDefault();
    runProfile(async () => {
      const updated = await updateProfile({
        name: profile.name.trim(),
        preferredCurrency: profile.preferredCurrency,
      });
      setCurrency(CURRENCIES[updated.preferredCurrency] || CURRENCIES.usd);
    }, "Profile updated");
  };

  const hasPassword = user.hasPassword !== false;

  const passwordHandler = async (event) => {
    event.preventDefault();
    const ok = await runPassword(
      async () => {
        if (passwords.next !== passwords.confirm) throw new Error("New passwords do not match");
        await changePassword(hasPassword ? passwords.current : undefined, passwords.next);
      },
      hasPassword
        ? "Password changed. Other devices have been signed out."
        : "Password set. You can now also log in with your email and password."
    );
    if (ok) setPasswords({ current: "", next: "", confirm: "" });
  };

  const deleteHandler = () => {
    const confirmed = window.confirm(
      "Delete your account? Your watchlist, portfolio and alerts will be permanently removed."
    );
    if (!confirmed) return;
    runDelete(async () => {
      await api.delete("/auth/me");
      logout();
      navigate("/", { replace: true });
    }, "");
  };

  return (
    <div className="page account">
      <div className="page-header">
        <h1>Account</h1>
        <p>{user.email}</p>
      </div>

      <form className="panel content-width" onSubmit={profileHandler}>
        <h3>Profile</h3>
        {profileStatus.error && <p className="form-error">{profileStatus.error}</p>}
        {profileStatus.success && <p className="form-success">{profileStatus.success}</p>}
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="acc-name">Name</label>
            <input
              id="acc-name"
              maxLength={50}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="acc-currency">Preferred currency</label>
            <select
              id="acc-currency"
              value={profile.preferredCurrency}
              onChange={(e) => setProfile({ ...profile, preferredCurrency: e.target.value })}
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name.toUpperCase()} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={profileStatus.saving}>
            {profileStatus.saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <form className="panel content-width" onSubmit={passwordHandler}>
        <h3>{hasPassword ? "Change password" : "Set a password"}</h3>
        {!hasPassword && (
          <p className="panel-text">
            You signed up with Google. Set a password to also log in with your email.
          </p>
        )}
        {passwordStatus.error && <p className="form-error">{passwordStatus.error}</p>}
        {passwordStatus.success && <p className="form-success">{passwordStatus.success}</p>}
        <div className="form-grid">
          {hasPassword && (
            <div className="form-field span-2">
              <label htmlFor="acc-current">Current password</label>
              <input
                id="acc-current"
                type="password"
                autoComplete="current-password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="acc-new">New password</label>
            <input
              id="acc-new"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="acc-confirm">Confirm new password</label>
            <input
              id="acc-confirm"
              type="password"
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
            />
          </div>
        </div>
        <span className="form-hint">At least 8 characters, with a letter and a number.</span>
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={passwordStatus.saving}>
            {passwordStatus.saving ? "Saving..." : hasPassword ? "Update password" : "Set password"}
          </button>
        </div>
      </form>

      <div className="panel danger-panel content-width">
        <h3>Delete account</h3>
        <p>This permanently removes your account, watchlist, portfolio and alerts.</p>
        {deleteStatus.error && <p className="form-error">{deleteStatus.error}</p>}
        <div className="form-actions">
          <button className="btn-danger" onClick={deleteHandler} disabled={deleteStatus.saving}>
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
