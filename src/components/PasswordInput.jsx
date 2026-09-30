// src/components/PasswordInput.jsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ value, onChange, onBlur, placeholder, required, minLength, autoFocus }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoFocus={autoFocus}
        style={{ paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--color-text-muted)',
          display: 'flex', padding: 4, borderRadius: 4,
        }}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
