type TokenFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper: string;
};

/**
 * Small reusable token input used by the protected demo flows.
 */
export default function TokenField({ label, value, onChange, helper }: TokenFieldProps) {
  return (
    <div className="formGrid mt12">
      <label className="muted small">{label}</label>
      <input
        className="input"
        type="password"
        placeholder="Paste bearer token"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="muted small">{helper}</div>
    </div>
  );
}