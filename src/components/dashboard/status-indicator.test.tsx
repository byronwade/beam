import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { StatusIndicator } from "./status-indicator";

describe("StatusIndicator", () => {
  test("renders active state with pulsing rings", () => {
    const { container } = render(<StatusIndicator status="active" />);
    const rings = container.querySelectorAll(".border-2");
    expect(rings.length).toBeGreaterThanOrEqual(2);
    const dot = container.querySelectorAll(".rounded-full");
    expect(dot.length).toBeGreaterThan(0);
  });

  test("renders pending with a single ring", () => {
    const { container } = render(<StatusIndicator status="pending" />);
    const rings = container.querySelectorAll(".border-2");
    expect(rings.length).toBeGreaterThanOrEqual(1);
  });

  test("renders inactive without rings", () => {
    const { container } = render(<StatusIndicator status="inactive" />);
    const rings = container.querySelectorAll(".border-2");
    expect(rings.length).toBe(0);
  });
});

