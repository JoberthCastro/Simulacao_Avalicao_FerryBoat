import './Input.css';

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
}

export default Input;

