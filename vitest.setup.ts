import "@testing-library/jest-dom";

// Provide a predictable test URL for components that rely on window location.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "location", {
    value: new URL("http://localhost"),
    writable: true,
  });
}

