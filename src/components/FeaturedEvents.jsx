import { useMemo, useState } from "react";
import EventCard from "./EventCard";

const INITIAL_COUNT = 3;

export default function FeaturedEvents({ events }) {
  const [expanded, setExpanded] = useState(false);

  const featuredEvents = useMemo(() => {
    const explicit = events.filter((event) => event.featured);
    if (explicit.length >= INITIAL_COUNT) {
      return explicit;
    }

    const sorted = [...events].sort((a, b) =>
      a.start_date.localeCompare(b.start_date),
    );
    return sorted.slice(0, Math.max(INITIAL_COUNT, explicit.length));
  }, [events]);

  if (!featuredEvents.length) {
    return null;
  }

  const visible = expanded
    ? featuredEvents
    : featuredEvents.slice(0, INITIAL_COUNT);

  return (
    <section className="featured-events" aria-label="Featured events">
      <div className="featured-events__header">
        <h2 className="featured-events__title">Featured Events</h2>
        {featuredEvents.length > INITIAL_COUNT && (
          <button
            type="button"
            className="featured-events__toggle"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      <div className="events-grid">
        {visible.map((event) => (
          <EventCard key={`featured-${event.id}`} event={event} />
        ))}
      </div>
    </section>
  );
}
