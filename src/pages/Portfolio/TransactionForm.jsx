import { useContext, useState } from "react";
import api from "../../api/client";
import { CoinContext } from "../../context/CoinContext";

const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const TransactionForm = ({ initialCoinId, onSaved, onCancel }) => {
  const { allCoin, currency } = useContext(CoinContext);

  const priceOf = (coinId) => allCoin.find((c) => c.id === coinId)?.current_price ?? "";
  const startCoin = initialCoinId || allCoin[0]?.id || "";

  const [form, setForm] = useState({
    coinId: startCoin,
    type: "buy",
    quantity: "",
    pricePerCoin: priceOf(startCoin),
    fee: "",
    date: today(),
    note: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "coinId" && { pricePerCoin: priceOf(value) }),
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/portfolio/transactions", {
        coinId: form.coinId,
        type: form.type,
        quantity: Number(form.quantity),
        pricePerCoin: Number(form.pricePerCoin),
        fee: form.fee === "" ? 0 : Number(form.fee),
        currency: currency.name,
        date: form.date,
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
    <form className="panel tx-form" onSubmit={submitHandler}>
      <h3>Add transaction</h3>
      {error && <p className="form-error">{error}</p>}

      <div className="type-toggle" role="radiogroup" aria-label="Transaction type">
        {["buy", "sell"].map((type) => (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={form.type === type}
            className={form.type === type ? `active ${type}` : ""}
            onClick={() => setForm((prev) => ({ ...prev, type }))}
          >
            {type === "buy" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div className="form-field span-2">
          <label htmlFor="tx-coin">Coin</label>
          <select id="tx-coin" name="coinId" value={form.coinId} onChange={changeHandler} required>
            {coinOptions.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} {coin.symbol && `(${coin.symbol.toUpperCase()})`}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="tx-quantity">Quantity</label>
          <input
            id="tx-quantity"
            name="quantity"
            type="number"
            min="0"
            step="any"
            value={form.quantity}
            onChange={changeHandler}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="tx-price">Price per coin ({currency.symbol})</label>
          <input
            id="tx-price"
            name="pricePerCoin"
            type="number"
            min="0"
            step="any"
            value={form.pricePerCoin}
            onChange={changeHandler}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="tx-fee">Fee ({currency.symbol})</label>
          <input
            id="tx-fee"
            name="fee"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={form.fee}
            onChange={changeHandler}
          />
        </div>
        <div className="form-field">
          <label htmlFor="tx-date">Date</label>
          <input
            id="tx-date"
            name="date"
            type="date"
            max={today()}
            value={form.date}
            onChange={changeHandler}
            required
          />
        </div>
        <div className="form-field span-2">
          <label htmlFor="tx-note">Note (optional)</label>
          <input
            id="tx-note"
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
          {saving ? "Saving..." : "Save transaction"}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
