import { useEffect, useState } from "react";
import { api, adminHeaders, getErrorMessage } from "../api";

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
  new_value: string; // optional (admin GET doesn't return existing value)
};

export default function AdminPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    cost_price: "",
    margin_percentage: "",
    value_type: "STRING" as "STRING" | "IMAGE",
    value: ""
  });

  // One edit panel (not inside each product)
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

  // Keep your working load (no hook changes)
  async function load() {
    try {
      const res = await api.get<AdminProduct[]>("/admin/products", {
        headers: adminHeaders()
      });
      setItems(res.data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        { headers: adminHeaders() }
      );

      setForm({
        name: "",
        description: "",
        image_url: "",
        cost_price: "",
        margin_percentage: "",
        value_type: "STRING",
        value: ""
      });

      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  function startEdit(p: AdminProduct) {
    setError("");
    setEditing(p);
    setDraft({
      name: p.name,
      description: p.description,
      image_url: p.image_url,
      cost_price: String(p.cost_price),
      margin_percentage: String(p.margin_percentage),
      value_type: p.value_type,
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

    // IMPORTANT: do NOT send minimum_sell_price (server computes it)
    const payload: Record<string, unknown> = {
      name: draft.name,
      description: draft.description,
      image_url: draft.image_url,
      cost_price: cost,
      margin_percentage: margin,
      value_type: draft.value_type
    };

    // Admin GET doesn't return existing value, so set new value only if provided
    if (draft.new_value.trim().length > 0) {
      payload.value = draft.new_value.trim();
    }

    try {
      await api.patch(`/admin/products/${editing.id}`, payload, {
        headers: adminHeaders()
      });

      setEditing(null);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  async function deleteProduct(productId: string) {
    setError("");
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/admin/products/${productId}`, { headers: adminHeaders() });

      if (editing?.id === productId) setEditing(null);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <div className="page">
      <div className="stack">
        <div>
          <h3 className="noTopMargin">Admin</h3>
          <p className="subtitle">Create / View / Update / Delete products (COUPON).</p>
        </div>

        {/* CREATE */}
        <div className="card">
          <div className="sectionHeader">
            <h4 className="noMargin">Create Product</h4>
            <span className="badge">Admin API</span>
          </div>

          <div className="formGrid mt12">
            <input className="input" placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="input" placeholder="image_url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <input className="input" placeholder="cost_price (number)" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
            <input className="input" placeholder="margin_percentage (number)" value={form.margin_percentage} onChange={(e) => setForm({ ...form, margin_percentage: e.target.value })} />

            <select value={form.value_type} onChange={(e) => setForm({ ...form, value_type: e.target.value as "STRING" | "IMAGE" })}>
              <option value="STRING">STRING</option>
              <option value="IMAGE">IMAGE</option>
            </select>

            <input className="input" placeholder="value (returned only after purchase)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />

            <div className="row end">
              <button className="btn secondary" onClick={() => { setError(""); load(); }}>Refresh</button>
              <button className="btn" onClick={create}>Create</button>
            </div>

            {error && <p className="errorText">{error}</p>}
          </div>
        </div>

        {/* EDIT PANEL (ONE, ONLY WHEN EDITING) */}
        {editing && (
          <div className="card">
            <div className="sectionHeader">
              <h4 className="noMargin">Edit Product</h4>
              <span className="badge">{editing.is_sold ? "SOLD" : "AVAILABLE"}</span>
            </div>

            <div className="muted small mt6">id: {editing.id}</div>
            <div className="muted small mt6">
              minimum_sell_price is computed server-side (do not edit it).
            </div>

            <div className="formGrid mt12">
              <input className="input" placeholder="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <input className="input" placeholder="description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <input className="input" placeholder="image_url" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
              <input className="input" placeholder="cost_price (number)" value={draft.cost_price} onChange={(e) => setDraft({ ...draft, cost_price: e.target.value })} />
              <input className="input" placeholder="margin_percentage (number)" value={draft.margin_percentage} onChange={(e) => setDraft({ ...draft, margin_percentage: e.target.value })} />

              <select value={draft.value_type} onChange={(e) => setDraft({ ...draft, value_type: e.target.value as "STRING" | "IMAGE" })}>
                <option value="STRING">STRING</option>
                <option value="IMAGE">IMAGE</option>
              </select>

              <input className="input" placeholder="new value (optional)" value={draft.new_value} onChange={(e) => setDraft({ ...draft, new_value: e.target.value })} />

              <div className="row end">
                <button className="btn secondary" onClick={cancelEdit}>Cancel</button>
                <button className="btn" onClick={saveEdit}>Save</button>
              </div>

              {error && <p className="errorText">{error}</p>}
            </div>
          </div>
        )}

        {/* LIST */}
        <div className="card">
          <div className="sectionHeader">
            <h4 className="noMargin">All Products</h4>
            <span className="badge">{items.length} items</span>
          </div>

          <div className="stack mt12">
            {items.map((p) => (
              <div key={p.id} className="card flat">
                <div className="sectionHeader">
                  <div className="row">
                    <b>{p.name}</b>
                    <span className="badge">{p.type}</span>
                  </div>
                  <span className="badge">{p.is_sold ? "SOLD" : "AVAILABLE"}</span>
                </div>

                <div className="mt8">{p.description}</div>

                <div className="mt8">
                  <b>min price:</b> {p.minimum_sell_price}
                </div>

                <div className="muted mt6">
                  cost: {p.cost_price} | margin%: {p.margin_percentage}
                </div>

                <div className="row mt12" style={{ justifyContent: "space-between" }}>
                  <button className="btn secondary" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                </div>

                <div className="muted small mt6">id: {p.id}</div>
              </div>
            ))}

            {items.length === 0 && <div>No products yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}