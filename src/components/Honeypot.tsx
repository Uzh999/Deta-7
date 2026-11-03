import { HONEYPOT_FIELD } from "../lib/leads";

type HoneypotProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * A field people never see or reach, but naive bots fill in like any other.
 * A lead that arrives with it set is dropped by the server.
 */
export default function Honeypot({ value, onChange }: HoneypotProps) {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Company
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}
