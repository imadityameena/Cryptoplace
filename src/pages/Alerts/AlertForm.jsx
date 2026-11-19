import { useContext, useState } from "react";
import api from "../../api/client";
import { CoinContext } from "../../context/CoinContext";
import { formatMoney } from "../../utils/format";

const AlertForm = ({ initialCoinId, onSaved, onCancel }) => {
  const { allCoin, currency } = useContext(CoinContext);

  const priceOf = (coinId) => allCoin.find((c) => c.id === coinId)?.current_price ?? "";
  const startCoin = initialCoinId || allCoin[0]?.id || "";

  const [form, setForm] = useState({
    coinId: startCoin,
    condition: "above",
    targetPrice: priceOf(startCoin),
    note: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currentPrice = priceOf(form.coinId);

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "coinId" && { targetPrice: priceOf(value) }),
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/alerts", {
        coinId: form.coinId,
        condition: form.condition,
        targetPrice: Number(form.targetPrice),
        currency: currency.name,
        note: form.note.trim() || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const coinOptions =
    form.coinId && !allCoin.some((c) => c.id === form.coinId)
      ? [{ id: form.coinId, name: form.coinId, symbol: "" }, ...allCoin]
      : allCoin;

  return (
    <form className="panel" onSubmit={submitHandler}>
      <h3>New price alert</h3>
      {error && <p className="form-error">{error}</p>}
      <div className="form-grid">
        <div className="form-field span-2">
          <label htmlFor="alert-coin">Coin</label>
          <select id="alert-coin" name="coinId" value={form.coinId} onChange={changeHandler} required>
            {coinOptions.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} {coin.symbol && `(${coin.symbol.toUpperCase()})`}
              </option>
            ))}
          </select>
          {currentPrice !== "" && (
            <span className="form-hint">
              Current price: {formatMoney(currentPrice, currency)}
            </span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="alert-condition">Notify when price goes</label>
          <select
            id="alert-condition"
            name="condition"
            value={form.condition}
            onChange={changeHandler}
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="alert-target">Target price ({currency.symbol})</label>
          <input
            id="alert-target"
            name="targetPrice"
            type="number"
            min="0"
            step="any"
            value={form.targetPrice}
            onChange={changeHandler}
            required
          />
        </div>
        <div className="form-field span-2">
          <label htmlFor="alert-note">Note (optional)</label>
          <input
            id="alert-note"
            name="note"
            maxLength={200}
            value={form.note}
            onChange={changeHandler}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Create alert"}
        </button>
      </div>
    </form>
  );
};

export default AlertForm;
