import './Select.css';

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`select-group ${className}`}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`select ${error ? 'select-error' : ''}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-message">{error}</span>}
    </div>
  );
}

export default Select;

