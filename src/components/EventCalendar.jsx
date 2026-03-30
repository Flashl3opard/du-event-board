import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

function toExclusiveEnd(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function EventCalendar({ events }) {
  if (!events.length) {
    return (
      <div className="empty-state" id="empty-state">
        <div className="empty-state__icon">📆</div>
        <h2 className="empty-state__title">No events found</h2>
        <p className="empty-state__description">
          No events are available for the current filters.
        </p>
      </div>
    );
  }

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start_date,
    end: toExclusiveEnd(event.end_date),
    url: event.url,
  }));

  return (
    <div className="calendar-view">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        height="auto"
        eventClick={(info) => {
          if (info.event.url) {
            info.jsEvent.preventDefault();
            window.open(info.event.url, "_blank", "noopener,noreferrer");
          }
        }}
      />
    </div>
  );
}
