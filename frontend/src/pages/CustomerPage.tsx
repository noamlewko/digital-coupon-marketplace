import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

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

/** Customer page: list available products + purchase at fixed minimum price (no token). */
export default function CustomerPage() {
  const [items, setItems] = useState<PublicProduct[]>([]);
  const [error, setError] = useState<string>("");
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);

  // Load available products for customers
  async function load() {
    try {
      const res = await api.get<PublicProduct[]>("/customer/products");
      setItems(res.data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  // Initial load
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function purchase(productId: string) {
    setError("");
    setPurchaseResult(null);

    try {
      const res = await api.post<PurchaseResponse>(`/customer/products/${productId}/purchase`, {});
      setPurchaseResult(res.data);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <div>
      <h3>Customer</h3>
      <p>Lists available products and purchases at the minimum price.</p>

      <button
        onClick={() => {
          setError("");
          setPurchaseResult(null);
          load();
        }}
      >
        Refresh
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {purchaseResult && (
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginTop: 12 }}>
          <b>Purchase Success</b>
          <div>product_id: {purchaseResult.product_id}</div>
          <div>final_price: {purchaseResult.final_price}</div>
          <div>value_type: {purchaseResult.value_type}</div>
          <div>value: {purchaseResult.value}</div>
        </div>
      )}

      <h4>Available Products</h4>
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
            <b>{p.name}</b>
            <div>{p.description}</div>
            <div>price: {p.price}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>id: {p.id}</div>
            <button onClick={() => purchase(p.id)}>Purchase</button>
          </div>
        ))}
        {items.length === 0 && <div>No available products</div>}
      </div>
    </div>
  );
}