import { useEffect, useState } from "react";
import { api, resellerHeaders, getErrorMessage } from "../api";

type PublicProduct = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number; // minimum_sell_price
};

type PurchaseResponse = {
  product_id: string;
  final_price: number;
  value_type: "STRING" | "IMAGE";
  value: string;
};

/** Reseller page: list available products + purchase with reseller_price (Bearer token). */
export default function ResellerPage() {
  const [items, setItems] = useState<PublicProduct[]>([]);
  const [error, setError] = useState<string>("");
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);
  const [resellerPrice, setResellerPrice] = useState<string>("");

  // Load available products from reseller API
  async function load() {
    try {
      const res = await api.get<PublicProduct[]>("/api/v1/products", {
        headers: resellerHeaders()
      });
      setItems(res.data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  // Initial load (on page mount)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function purchase(productId: string) {
    setError("");
    setPurchaseResult(null);

    const priceNum = Number(resellerPrice);
    if (!Number.isFinite(priceNum)) {
      setError("Please enter a valid reseller_price number");
      return;
    }

    try {
      const res = await api.post<PurchaseResponse>(
        `/api/v1/products/${productId}/purchase`,
        { reseller_price: priceNum },
        { headers: resellerHeaders() }
      );
      setPurchaseResult(res.data);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <div>
      <h3>Reseller</h3>
      <p>Lists products via the reseller API and purchases with a reseller price.</p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          placeholder="reseller_price"
          value={resellerPrice}
          onChange={(e) => setResellerPrice(e.target.value)}
          style={{ width: 220 }}
        />
        <button
          onClick={() => {
            setError("");
            setPurchaseResult(null);
            load();
          }}
        >
          Refresh
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {purchaseResult && (
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <b>Purchase Success</b>
          <div>product_id: {purchaseResult.product_id}</div>
          <div>final_price: {purchaseResult.final_price}</div>
          <div>value_type: {purchaseResult.value_type}</div>
          <div>value: {purchaseResult.value}</div>
        </div>
      )}

      <h4>Available Products</h4>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
            <b>{p.name}</b>
            <div>{p.description}</div>
            <div>minimum_sell_price: {p.price}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>id: {p.id}</div>
            <button onClick={() => purchase(p.id)}>Purchase</button>
          </div>
        ))}
        {items.length === 0 && <div>No available products</div>}
      </div>
    </div>
  );
}