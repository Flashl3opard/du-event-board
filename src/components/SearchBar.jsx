import DateRangeFilter from "./filters/DateRangeFilter";
import FilterSelect from "./filters/FilterSelect";

export default function SearchBar({
  searchTerm,
  onSearchChange,
  selectedCountry,
  onCountryChange,
  selectedState,
  onStateChange,
  selectedEventType,
  onEventTypeChange,
  selectedCost,
  onCostChange,
  selectedHashtag,
  onHashtagChange,
  rangeStart,
  onRangeStartChange,
  rangeEnd,
  onRangeEndChange,
  countries,
  states,
  hashtags,
}) {

  return (
    <div className="search" id="search">
      <div className="search__container">
        <div className="search__row search__row--primary">
          <div className="search__input-wrapper">
            <label htmlFor="search-input" className="search__label">
              Search events
            </label>
            <span className="search__icon">🔍</span>
            <input
              id="search-input"
              type="text"
              className="search__input"
              placeholder="Search events by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <FilterSelect
            id="country-select"
            label="Country"
            value={selectedCountry}
            onChange={onCountryChange}
            options={countries}
            allLabel="All Countries"
          />

          <FilterSelect
            id="state-select"
            label="State/Province"
            value={selectedState}
            onChange={onStateChange}
            options={states}
            allLabel="All States/Provinces"
          />
        </div>

        <div className="search__row search__row--date">
          <FilterSelect
            id="event-type-select"
            label="Event type"
            value={selectedEventType}
            onChange={onEventTypeChange}
            options={["online", "in-person", "hybrid"]}
            allLabel="All Event Types"
          />

          <FilterSelect
            id="cost-select"
            label="Cost"
            value={selectedCost}
            onChange={onCostChange}
            options={["free", "paid"]}
            allLabel="All Costs"
          />

          <FilterSelect
            id="hashtag-select"
            label="Hashtag"
            value={selectedHashtag}
            onChange={onHashtagChange}
            options={hashtags}
            allLabel="All Hashtags"
          />

          <DateRangeFilter
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeStartChange={onRangeStartChange}
            onRangeEndChange={onRangeEndChange}
          />
        </div>
      </div>
    </div>
  );
}
