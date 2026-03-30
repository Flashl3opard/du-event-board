import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";

describe("App", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("renders the main header", () => {
    render(<App />);
    expect(screen.getByText("DU Event Board")).toBeInTheDocument();
  });

  it("filters events by search text", () => {
    render(<App />);
    const input = screen.getByPlaceholderText(
      "Search events by name, description, or tags...",
    );

    fireEvent.change(input, { target: { value: "react" } });

    expect(screen.getByText(/Showing/).textContent).toContain("1");
  });

  it("filters events by state/province", () => {
    render(<App />);
    const stateSelect = screen.getByLabelText("State/Province");

    fireEvent.change(stateSelect, { target: { value: "Porto Alegre" } });

    expect(screen.getByText(/Showing/).textContent).toContain("2");
  });

  it("filters events by date range", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Range start date"), {
      target: { value: "2026-04-10" },
    });
    fireEvent.change(screen.getByLabelText("Range end date"), {
      target: { value: "2026-04-18" },
    });

    expect(screen.getByText(/Showing/).textContent).toContain("3");
  });

  it("shows empty state for an invalid date range", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Range start date"), {
      target: { value: "2026-04-18" },
    });
    fireEvent.change(screen.getByLabelText("Range end date"), {
      target: { value: "2026-04-10" },
    });

    expect(screen.getByText("No events found")).toBeInTheDocument();
  });

  it("switches to calendar view", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Calendar" }));
    expect(document.querySelector(".calendar-view")).not.toBeNull();
  });
});
