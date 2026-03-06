import { useCallback, useEffect, useState } from "react";
import TokenField from "../components/TokenField";
import {
  api,
  getErrorMessage,
  getResellerToken,
  resellerHeaders,
  setResellerToken
} from "../api";

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
 * Reseller page:
 * - Uses the protected reseller API
 * - Stores a pre-shared reseller token locally after one manual entry
 * - Still relies on backend pricing enforcement for the actual purchase rule
 */
export default function ResellerPage() {
  const [items, setItems] = useState<PublicProduct[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);
  const [resellerPrice, setResellerPrice] = useState("");
  const [resellerToken, setResellerTokenState] = useState(getResellerToken());
  const [resellerTokenInput, setResellerTokenInput] = useState(getResellerToken());

  const load = useCallback(async () => {
    if (!resellerToken.trim()) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get<PublicProduct[]>("/api/v1/products", {
        headers: resellerHeaders(resellerToken)
      });
      setItems(res.data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [resellerToken]);

  useEffect(() => {
    void load();
  }, [load]);

  async function unlockReseller() {
    const token = resellerTokenInput.trim();

    if (!token) {
      setError("Please enter the reseller token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.get("/api/v1/products", {
        headers: resellerHeaders(token)
      });

      setResellerToken(token);
      setResellerTokenState(token);
    } catch {
      setError("Invalid reseller token");
    } finally {
      setLoading(false);
    }
  }

  function clearResellerAccess() {
    setResellerToken("");
    setResellerTokenState("");
    setResellerTokenInput("");
    setItems([]);
    setPurchaseResult(null);
    setError("");
  }

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
        { headers: resellerHeaders(resellerToken) }
      );

      setPurchaseResult(res.data);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  if (!resellerToken.trim()) {
    return (
      <div className="page">
        <div className="stack">
          <div>
            <h3 className="noTopMargin">Reseller</h3>
            <p className="subtitle">
              Lists products via the reseller API and purchases with a reseller price.
            </p>
          </div>

          <div className="card">
            <div className="sectionHeader">
              <h4 className="noMargin">Reseller Access</h4>
              <span className="badge">Protected</span>
            </div>

            <TokenField
              label="Reseller token"
              value={resellerTokenInput}
              onChange={setResellerTokenInput}
              helper="Use the demo reseller token configured in the environment. It is stored only in this browser."
            />

            <div className="row end mt12">
                <button className="btn" onClick={unlockReseller} disabled={loading}>
                    {loading ? "Checking..." : "Continue"}
                </button>
            </div>

            {error && <p className="errorText mt12">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="stack">
        <div>
          <h3 className="noTopMargin">Reseller</h3>
          <p className="subtitle">
            Lists products via the reseller API and purchases with a reseller price.
          </p>
        </div>

        <div className="card">
          <div className="sectionHeader">
            <h4 className="noMargin">Reseller Access</h4>
            <span className="badge">Authenticated</span>
          </div>

          <div className="row end mt12">
            <button className="btn secondary" onClick={clearResellerAccess}>
              Clear Token
            </button>
          </div>
        </div>

        <div className="card">
          <div className="sectionHeader">
            <h4 className="noMargin">Available Products</h4>
            <span className="badge">Reseller API</span>
          </div>

          <div className="row mt12">
            <input
              className="input"
              placeholder="reseller_price"
              value={resellerPrice}
              onChange={(e) => setResellerPrice(e.target.value)}
            />
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

          <p className="muted small mt6">
            The backend validates that reseller_price is greater than or equal to the
            minimum sell price.
          </p>

          {error && <p className="errorText mt12">{error}</p>}

          {purchaseResult && (
            <div className="card flat mt12">
              <div className="sectionHeader">
                <b>Purchase Success</b>
                <span className="badge">{purchaseResult.value_type}</span>
              </div>

              <div className="mt8">product_id: {purchaseResult.product_id}</div>
              <div className="mt6">final_price: {purchaseResult.final_price}</div>
              <div className="mt6">value: {purchaseResult.value}</div>
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
                    <span className="badge">min price: {product.price}</span>
                  </div>

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