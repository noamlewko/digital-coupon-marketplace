import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage } from "../api";

type PublicProduct = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
};

type PurchaseResponse = {
  product_id: string;
  final_price: number;
  value_type: "STRING" | "IMAGE";
  value: string;
};

/**
 * Customer page for the direct purchase flow.
 * Unlike the reseller flow, customers do not send a price at all.
 */
function renderPurchaseValue(result: PurchaseResponse) {
  if (result.value_type === "IMAGE") {
    return <img className="previewImage mt8" src={result.value} alt="Purchased coupon value" />;
  }

  return <div className="mt6 monospace">value: {result.value}</div>;
}

export default function CustomerPage() {
  const [items, setItems] = useState<PublicProduct[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get<PublicProduct[]>("/customer/products");
      setItems(res.data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function purchase(productId: string) {
    setError("");
    setPurchaseResult(null);

    try {
      const res = await api.post<PurchaseResponse>(`/customer/products/${productId}/purchase`);
      setPurchaseResult(res.data);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <div className="page">
      <div className="stack">
        <div>
          <h3 className="noTopMargin">Customer</h3>
          <p className="subtitle">Browse available coupons and purchase at the fixed minimum sell price.</p>
        </div>

        <div className="card">
          <div className="sectionHeader">
            <h4 className="noMargin">Available Products</h4>
            <span className="badge">Customer Flow</span>
          </div>

          <div className="row end mt12">
            <button
              className="btn secondary"
              onClick={() => {
                setError("");
                setPurchaseResult(null);
                void load();
              }}
            >
              Refresh
            </button>
          </div>

          {error && <p className="errorText mt12">{error}</p>}

          {purchaseResult && (
            <div className="card flat mt12">
              <div className="sectionHeader">
                <b>Purchase Success</b>
                <span className="badge">{purchaseResult.value_type}</span>
              </div>

              <div className="mt8">product_id: {purchaseResult.product_id}</div>
              <div className="mt6">final_price: {purchaseResult.final_price}</div>
              {renderPurchaseValue(purchaseResult)}
            </div>
          )}

          {loading ? (
            <p className="muted mt12">Loading products...</p>
          ) : (
            <div className="stack mt12">
              {items.map((product) => (
                <div key={product.id} className="card flat">
                  <div className="sectionHeader">
                    <b>{product.name}</b>
                    <span className="badge">price: {product.price}</span>
                  </div>

                  <img className="previewImage mt12" src={product.image_url} alt={product.name} />
                  <div className="mt8">{product.description}</div>
                  <div className="muted small mt6">id: {product.id}</div>

                  <div className="row end mt12">
                    <button className="btn" onClick={() => purchase(product.id)}>
                      Purchase
                    </button>
                  </div>
                </div>
              ))}

              {items.length === 0 && <div>No available products</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}