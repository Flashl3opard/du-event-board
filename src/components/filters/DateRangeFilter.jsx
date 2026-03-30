export default function DateRangeFilter({
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
}) {
  const isInvalidRange = rangeStart && rangeEnd && rangeStart > rangeEnd;

  return (
    <div className="search__date-range" role="group" aria-label="Date range">
      <label htmlFor="range-start-input" className="search__label">
        Start date
      </label>
      <input
        id="range-start-input"
        type="date"
        className={`search__date-input search__select ${
          isInvalidRange ? "search__date-input--invalid" : ""
        }`}
        value={rangeStart}
        max={rangeEnd || undefined}
        onChange={(event) => onRangeStartChange(event.target.value)}
        aria-label="Range start date"
      />

      <label htmlFor="range-end-input" className="search__label">
        End date
      </label>
      <input
        id="range-end-input"
        type="date"
        className={`search__date-input search__select ${
          isInvalidRange ? "search__date-input--invalid" : ""
        }`}
        value={rangeEnd}
        min={rangeStart || undefined}
        onChange={(event) => onRangeEndChange(event.target.value)}
        aria-label="Range end date"
      />

      {isInvalidRange && (
        <div className="search__error-message">
          <span>Start date cannot be after end date</span>
        </div>
      )}
    </div>
  );
}
