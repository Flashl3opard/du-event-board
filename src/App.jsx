import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import EventCard from "./components/EventCard";
import EventMap from "./components/EventMap";
import EventCalendar from "./components/EventCalendar";
import FeaturedEvents from "./components/FeaturedEvents";
import Footer from "./components/Footer";
import rawEvents from "./data/events.json";
import { useUrlState } from "./hooks/useUrlState";

function normalizeHashtag(value) {
  return String(value).trim().replace(/^#+/, "").toLowerCase();
}

function normalizeEvent(event) {
  const locationText = String(event.location ?? "").toLowerCase();
  const inferredType =
    locationText === "online" || locationText.includes("virtual")
      ? "online"
      : "in-person";

  const startDate = event.start_date ?? event.date ?? "";
  const endDate = event.end_date ?? startDate;
  const hashtags = (event.hashtags ?? event.tags ?? [])
    .map(normalizeHashtag)
    .filter(Boolean);
  const stateOrProvince = event.state_province ?? event.region ?? "Unspecified";

  return {
    ...event,
    event_type: event.event_type ?? inferredType,
    cost: event.cost ?? "free",
    start_date: startDate,
    end_date: endDate,
    country: event.country ?? (inferredType === "online" ? "Global" : "Unknown"),
    state_province: stateOrProvince,
    hashtags,
    organization_logo: event.organization_logo ?? "",
    featured: Boolean(event.featured),

    // Compatibility aliases for existing components.
    date: event.date ?? startDate,
    region: event.region ?? stateOrProvince,
    tags: event.tags ?? hashtags,
  };
}

function asDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = String(isoDate)
    .split("-")
    .map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function inRange(event, rangeStart, rangeEnd) {
  const start = asDate(event.start_date);
  const end = asDate(event.end_date) ?? start;
  const filterStart = asDate(rangeStart);
  const filterEnd = asDate(rangeEnd);

  if (!start || !end) return false;

  if (filterStart && end < filterStart) return false;
  if (filterEnd && start > filterEnd) return false;
  return true;
}

export default function App() {
  const [searchTerm, setSearchTerm] = useUrlState("search", "");
  const [selectedCountry, setSelectedCountry] = useUrlState("country", "");
  const [selectedState, setSelectedState] = useUrlState("state", "");
  const [selectedEventType, setSelectedEventType] = useUrlState("type", "");
  const [selectedCost, setSelectedCost] = useUrlState("cost", "");
  const [selectedHashtag, setSelectedHashtag] = useUrlState("hashtag", "");
  const [rangeStart, setRangeStart] = useUrlState("rangeStart", "");
  const [rangeEnd, setRangeEnd] = useUrlState("rangeEnd", "");
  const [viewMode, setViewMode] = useUrlState("view", "list");
  const [currentPage, setCurrentPage] = useUrlState("page", "events");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const [theme, setTheme] = useState(() => {
    if (
      typeof window !== "undefined" &&
      window.localStorage &&
      typeof window.localStorage.getItem === "function"
    ) {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }

    if (typeof localStorage !== "undefined" && localStorage.setItem) {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const events = useMemo(() => rawEvents.map(normalizeEvent), []);

  const countries = useMemo(() => {
    return [...new Set(events.map((event) => event.country))].sort();
  }, [events]);

  const states = useMemo(() => {
    const filteredByCountry = selectedCountry
      ? events.filter((event) => event.country === selectedCountry)
      : events;

    return [...new Set(filteredByCountry.map((event) => event.state_province))].sort();
  }, [events, selectedCountry]);

  const hashtags = useMemo(() => {
    return [...new Set(events.flatMap((event) => event.hashtags))].sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
      return [];
    }

    return events.filter((event) => {
      const matchesSearch =
        !term ||
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.hashtags.some((tag) => tag.includes(term)) ||
        event.tags.some((tag) => String(tag).toLowerCase().includes(term));

      const matchesCountry = !selectedCountry || event.country === selectedCountry;
      const matchesState = !selectedState || event.state_province === selectedState;
      const matchesType = !selectedEventType || event.event_type === selectedEventType;
      const matchesCost = !selectedCost || event.cost === selectedCost;
      const matchesHashtag = !selectedHashtag || event.hashtags.includes(selectedHashtag);
      const matchesDateRange = inRange(event, rangeStart, rangeEnd);

      return (
        matchesSearch &&
        matchesCountry &&
        matchesState &&
        matchesType &&
        matchesCost &&
        matchesHashtag &&
        matchesDateRange
      );
    });
  }, [
    events,
    searchTerm,
    selectedCountry,
    selectedState,
    selectedEventType,
    selectedCost,
    selectedHashtag,
    rangeStart,
    rangeEnd,
  ]);

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={setCurrentPage}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        selectedEventType={selectedEventType}
        onEventTypeChange={setSelectedEventType}
        selectedCost={selectedCost}
        onCostChange={setSelectedCost}
        selectedHashtag={selectedHashtag}
        onHashtagChange={setSelectedHashtag}
        rangeStart={rangeStart}
        onRangeStartChange={setRangeStart}
        rangeEnd={rangeEnd}
        onRangeEndChange={setRangeEnd}
        countries={countries}
        states={states}
        hashtags={hashtags}
      />

      <main className="main" id="main-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            paddingLeft: "0.25rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <p
            className="main__results-info"
            style={{ marginBottom: 0, paddingLeft: 0 }}
          >
            Showing <span className="main__results-count">{filteredEvents.length}</span>{" "}
            event{filteredEvents.length !== 1 ? "s" : ""}
          </p>

          <div
            className="view-toggle"
            style={{
              display: "flex",
              gap: "0.5rem",
              background: "var(--bg-input)",
              padding: "0.3rem",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("list")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                background:
                  viewMode === "list" ? "var(--accent-primary)" : "transparent",
                color: viewMode === "list" ? "#fff" : "var(--text-muted)",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                background:
                  viewMode === "map" ? "var(--accent-primary)" : "transparent",
                color: viewMode === "map" ? "#fff" : "var(--text-muted)",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                background:
                  viewMode === "calendar"
                    ? "var(--accent-primary)"
                    : "transparent",
                color: viewMode === "calendar" ? "#fff" : "var(--text-muted)",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              Calendar
            </button>
          </div>
        </div>

        {viewMode === "list" && <FeaturedEvents events={filteredEvents} />}

        {viewMode === "list" ? (
          <div className="events-grid" id="events-grid">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
            ) : (
              <div className="empty-state" id="empty-state">
                <div className="empty-state__icon">🔎</div>
                <h2 className="empty-state__title">No events found</h2>
                <p className="empty-state__description">
                  Try adjusting your search terms or filters to find events near you.
                </p>
              </div>
            )}
          </div>
        ) : viewMode === "map" ? (
          <EventMap events={filteredEvents} />
        ) : (
          <EventCalendar events={filteredEvents} />
        )}
      </main>

      <Footer onNavigate={setCurrentPage} />
    </>
  );
}
