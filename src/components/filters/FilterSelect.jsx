export default function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  allLabel,
}) {
  return (
    <div className="search__select-wrapper">
      <label htmlFor={id} className="search__label">
        {label}
      </label>
      <select
        id={id}
        className="search__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
