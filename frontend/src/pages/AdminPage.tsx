import { useCallback, useEffect, useState } from "react";
import TokenField from "../components/TokenField";
import {
  adminHeaders,
  api,
  getAdminToken,
  getErrorMessage,
  setAdminToken
} from "../api";

type AdminProduct = {
  id: string;
  name: string;
  description: string;
  type: "COUPON";
  image_url: string;
  is_sold: boolean;
  cost_price: number;
  margin_percentage: number;
  minimum_sell_price: number;
  value_type: "STRING" | "IMAGE";
  created_at: string;
  updated_at: string;
};

type EditDraft = {
  name: string;
  description: string;
  image_url: string;
  cost_price: string;
  margin_percentage: string;
  value_type: "STRING" | "IMAGE";
  new_value: string;
};

const emptyForm = {
  name: "",
  description: "",
  image_url: "",
  cost_price: "",
  margin_percentage: "",
  value_type: "STRING" as "STRING" | "IMAGE",
  value: ""
};

/**
 * Admin UI for coupon CRUD operations.
 * The backend keeps admin endpoints protected, while the UI stores the admin token
 * locally after the reviewer enters it once.
 */
export default function AdminPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminToken, setAdminTokenState] = useState(getAdminToken());
  const [adminTokenInput, setAdminTokenInput] = useState(getAdminToken());

  const [form, setForm] = useState(emptyForm);

  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [draft, setDraft] = useState<EditDraft>({
    name: "",
    description: "",
    image_url: "",
    cost_price: "",
    margin_percentage: "",
    value_type: "STRING",
    new_value: ""
  });

  const load = useCallback(async () => {
    if (!adminToken.trim()) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get<AdminProduct[]>("/admin/products", {
        headers: adminHeaders(adminToken)
      });
      setItems(res.data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    void load();
  }, [load]);

  function unlockAdmin() {
    const token = adminTokenInput.trim();
    if (!token) {
      setError("Please enter the admin token");
      return;
    }

    setAdminToken(token);
    setAdminTokenState(token);
    setError("");
  }

  function clearAdminAccess() {
    setAdminToken("");
    setAdminTokenState("");
    setAdminTokenInput("");
    setItems([]);
    setEditing(null);
    setError("");
  }

  async function create() {
    setError("");

    const cost = Number(form.cost_price);
    const margin = Number(form.margin_percentage);

    if (!form.name || !form.description || !form.image_url || !form.value) {
      setError("Missing required fields");
      return;
    }

    if (!Number.isFinite(cost) || cost < 0) {
      setError("cost_price must be a valid number >= 0");
      return;
    }

    if (!Number.isFinite(margin) || margin < 0) {
      setError("margin_percentage must be a valid number >= 0");
      return;
    }

    try {
      await api.post(
        "/admin/products",
        {
          name: form.name,
          description: form.description,
          image_url: form.image_url,
          cost_price: cost,
          margin_percentage: margin,
          value_type: form.value_type,
          value: form.value
        },
        { headers: adminHeaders(adminToken) }
      );

      setForm(emptyForm);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  function startEdit(product: AdminProduct) {
    // Sold products are intentionally read-only in the admin UI.
    if (product.is_sold) return;

    setError("");
    setEditing(product);
    setDraft({
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      cost_price: String(product.cost_price),
      margin_percentage: String(product.margin_percentage),
      value_type: product.value_type,
      new_value: ""
    });
  }

  function cancelEdit() {
    setError("");
    setEditing(null);
  }

  async function saveEdit() {
    if (!editing) return;

    setError("");

    const cost = Number(draft.cost_price);
    const margin = Number(draft.margin_percentage);

    if (!draft.name || !draft.description || !draft.image_url) {
      setError("Missing required fields (name/description/image_url)");
      return;
    }

    if (!Number.isFinite(cost) || cost < 0) {
      setError("cost_price must be a valid number >= 0");
      return;
    }

    if (!Number.isFinite(margin) || margin < 0) {
      setError("margin_percentage must be a valid number >= 0");
      return;
    }

    const payload: Record<string, unknown> = {
      name: draft.name,
      description: draft.description,
      image_url: draft.image_url,
      cost_price: cost,
      margin_percentage: margin,
      value_type: draft.value_type
    };

    if (draft.new_value.trim().length > 0) {
      payload.value = draft.new_value.trim();
    }

    try {
      await api.patch(`/admin/products/${editing.id}`, payload, {
        headers: adminHeaders(adminToken)
      });

      setEditing(null);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  async function deleteProduct(product: AdminProduct) {
    setError("");

    if (product.is_sold) {
      setError("Sold products cannot be deleted");
      return;
    }

    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/admin/products/${product.id}`, {
        headers: adminHeaders(adminToken)
      });

      if (editing?.id === product.id) {
        setEditing(null);
      }

      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  if (!adminToken.trim()) {
    return (
      <div className="page">
        <div className="stack">
          <div>
            <h3 className="noTopMargin">Admin</h3>
            <p className="subtitle">Create / View / Update / Delete products (COUPON).</p>
          </div>

          <div className="card">
            <div className="sectionHeader">
              <h4 className="noMargin">Admin Access</h4>
              <span className="badge">Protected</span>
            </div>

            <TokenField
              label="Admin token"
              value={adminTokenInput}
              onChange={setAdminTokenInput}
              helper="Use the demo admin token configured in the environment. It is stored only in this browser."
            />

            <div className="row end mt12">
              <button className="btn" onClick={unlockAdmin}>
                Continue
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
          <h3 className="noTopMargin">Admin</h3>
          <p className="subtitle">Create / View / Update / Delete products (COUPON).</p>
        </div>

        <div className="card">
          <div className="sectionHeader">
            <h4 className="noMargin">Admin Access</h4>
            <span className="badge">Authenticated</span>
          </div>

          <div className="row end mt12">
            <button className="btn secondary" onClick={clearAdminAccess}>
              Clear Token
            </button>
          </div>
        </div>

        <div className="card">
          <div className="sectionHeader">
            <h4 className="noMargin">Create Product</h4>
            <span className="badge">Admin API</span>
          </div>

          <div className="formGrid mt12">
            <input
              className="input"
              placeholder="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              className="input"
              placeholder="image_url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <input
              className="input"
              placeholder="cost_price (number)"
              value={form.cost_price}
              onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
            />
            <input
              className="input"
              placeholder="margin_percentage (number)"
              value={form.margin_percentage}
              onChange={(e) => setForm({ ...form, margin_percentage: e.target.value })}
            />

            <select
              value={form.value_type}
              onChange={(e) =>
                setForm({ ...form, value_type: e.target.value as "STRING" | "IMAGE" })
              }
            >
              <option value="STRING">STRING</option>
              <option value="IMAGE">IMAGE</option>
            </select>

            <input
              className="input"
              placeholder="value (returned only after purchase)"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />

            <div className="row end">
              <button className="btn secondary" onClick={() => void load()}>
                Refresh
              </button>
              <button className="btn" onClick={create}>
                Create
              </button>
            </div>

            {error && <p className="errorText">{error}</p>}
          </div>
        </div>

        {editing && (
          <div className="card">
            <div className="sectionHeader">
              <h4 className="noMargin">Edit Product</h4>
              <span className="badge">{editing.is_sold ? "SOLD" : "AVAILABLE"}</span>
            </div>

            <div className="muted small mt6">id: {editing.id}</div>
            <div className="muted small mt6">
              minimum_sell_price is computed server-side and cannot be edited directly.
            </div>

            <div className="formGrid mt12">
              <input
                className="input"
                placeholder="name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              <input
                className="input"
                placeholder="description"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
              <input
                className="input"
                placeholder="image_url"
                value={draft.image_url}
                onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
              />
              <input
                className="input"
                placeholder="cost_price (number)"
                value={draft.cost_price}
                onChange={(e) => setDraft({ ...draft, cost_price: e.target.value })}
              />
              <input
                className="input"
                placeholder="margin_percentage (number)"
                value={draft.margin_percentage}
                onChange={(e) => setDraft({ ...draft, margin_percentage: e.target.value })}
              />

              <select
                value={draft.value_type}
                onChange={(e) =>
                  setDraft({ ...draft, value_type: e.target.value as "STRING" | "IMAGE" })
                }
              >
                <option value="STRING">STRING</option>
                <option value="IMAGE">IMAGE</option>
              </select>

              <input
                className="input"
                placeholder="new coupon value (optional)"
                value={draft.new_value}
                onChange={(e) => setDraft({ ...draft, new_value: e.target.value })}
              />

              <div className="row end">
                <button className="btn secondary" onClick={cancelEdit}>
                  Cancel
                </button>
                <button className="btn" onClick={saveEdit}>
                  Save
                </button>
              </div>

              {error && <p className="errorText">{error}</p>}
            </div>
          </div>
        )}

        <div className="card">
          <div className="sectionHeader">
            <h4 className="noMargin">All Products</h4>
            <span className="badge">{items.length} items</span>
          </div>

          {loading ? (
            <p className="muted mt12">Loading products...</p>
          ) : (
            <div className="stack mt12">
              {items.map((product) => (
                <div key={product.id} className="card flat">
                  <div className="sectionHeader">
                    <div className="row">
                      <b>{product.name}</b>
                      <span className="badge">{product.type}</span>
                    </div>
                    <span className="badge">{product.is_sold ? "SOLD" : "AVAILABLE"}</span>
                  </div>

                  <div className="mt8">{product.description}</div>
                  <div className="mt8">
                    <b>min price:</b> {product.minimum_sell_price}
                  </div>
                  <div className="muted mt6">
                    cost: {product.cost_price} | margin%: {product.margin_percentage}
                  </div>
                  <div className="muted small mt6">id: {product.id}</div>

                  {product.is_sold ? (
                    <div className="muted small mt12">
                      Sold products are read-only and cannot be edited or deleted.
                    </div>
                  ) : (
                    <div className="row spaceBetween mt12">
                      <button className="btn secondary" onClick={() => startEdit(product)}>
                        Edit
                      </button>
                      <button className="btn danger" onClick={() => deleteProduct(product)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {items.length === 0 && <div>No products yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}