'use client';

import { useState } from 'react';

export default function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hint,
  labelExtra,
  autoComplete,
  min,
}) {
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div className="auth-field">
      <div className="auth-field__label-row">
        <label htmlFor={id}>{label}</label>
        {labelExtra}
      </div>
      <div
        className={`auth-input-wrap${isPassword ? ' auth-input-wrap--with-toggle' : ''}${error ? ' auth-input-wrap--error' : ''}`}
      >
        <input
          id={id}
          type={inputType}
          className="auth-input"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          min={min}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        />
        {isPassword ? (
          <button
            type="button"
            className="auth-input-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            <i className={`ti ${visible ? 'ti-eye-off' : 'ti-eye'}`} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="auth-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="auth-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
