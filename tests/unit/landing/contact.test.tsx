// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/fade-in", () => ({
  FadeIn: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock("@/components/navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import ContactPage from "@landing/app/contact/page";

beforeEach(() => {
  fetchMock.mockReset();
  // Default: GitHub star fetch succeeds (Navbar), form submissions configured per-test
  fetchMock.mockImplementation((url: string) => {
    if (url.includes("github.com")) {
      return Promise.resolve({ json: () => Promise.resolve({ stargazers_count: 100 }) });
    }
    return Promise.resolve({ ok: true });
  });
});

afterEach(cleanup);

describe("ContactPage", () => {
  it("renders the page heading", () => {
    render(<ContactPage />);
    expect(screen.getByText("Get in touch")).toBeDefined();
  });

  it("renders all three benefit cards", () => {
    render(<ContactPage />);
    expect(screen.getByText("Live Demo")).toBeDefined();
    expect(screen.getByText("Deployment Support")).toBeDefined();
    // "Enterprise Licensing" appears as both a card title and a dropdown option
    expect(screen.getAllByText("Enterprise Licensing").length).toBeGreaterThanOrEqual(2);
  });

  it("renders all form fields", () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/Name/)).toBeDefined();
    expect(screen.getByLabelText(/Email/)).toBeDefined();
    expect(screen.getByLabelText(/Company/)).toBeDefined();
    expect(screen.getByLabelText(/Subject/)).toBeDefined();
    expect(screen.getByLabelText(/Message/)).toBeDefined();
  });

  it("renders the submit button", () => {
    render(<ContactPage />);
    expect(screen.getByText("Send Message")).toBeDefined();
  });

  it("renders subject dropdown with all options", () => {
    render(<ContactPage />);
    const select = screen.getByLabelText(/Subject/) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual([
      "Book a Demo",
      "Enterprise Licensing",
      "Deployment Help",
      "General Inquiry",
    ]);
  });

  it("defaults subject to Book a Demo", () => {
    render(<ContactPage />);
    const select = screen.getByLabelText(/Subject/) as HTMLSelectElement;
    expect(select.value).toBe("Book a Demo");
  });

  it("shows success state after form submission", async () => {
    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: "TestCo" } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Hello" } });
    fireEvent.submit(screen.getByText("Send Message").closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Message sent!")).toBeDefined();
    });
    expect(screen.getByText(/Thanks for reaching out/)).toBeDefined();
  });

  it("shows error message on failed submission", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("github.com")) {
        return Promise.resolve({ json: () => Promise.resolve({ stargazers_count: 100 }) });
      }
      return Promise.resolve({ ok: false, status: 500 });
    });

    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: "TestCo" } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Hello" } });
    fireEvent.submit(screen.getByText("Send Message").closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/)).toBeDefined();
    });
  });

  it("shows error message on network failure", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("github.com")) {
        return Promise.resolve({ json: () => Promise.resolve({ stargazers_count: 100 }) });
      }
      return Promise.reject(new Error("Network error"));
    });

    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Test User" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: "TestCo" } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Hello" } });
    fireEvent.submit(screen.getByText("Send Message").closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeDefined();
    });
  });

  it("allows sending another message after success", async () => {
    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "t@t.com" } });
    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: "Co" } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Hi" } });
    fireEvent.submit(screen.getByText("Send Message").closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Message sent!")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Send another message"));
    expect(screen.getByText("Send Message")).toBeDefined();
  });

  it("submits to Formspree URL", async () => {
    render(<ContactPage />);
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "t@t.com" } });
    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: "Co" } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Hi" } });
    fireEvent.submit(screen.getByText("Send Message").closest("form")!);

    await waitFor(() => {
      const formspreeCall = fetchMock.mock.calls.find(
        (c: string[]) => typeof c[0] === "string" && c[0].includes("formspree.io"),
      );
      expect(formspreeCall).toBeDefined();
      expect(formspreeCall![0]).toBe("https://formspree.io/f/mykllwek");
    });
  });

  it("renders the email fallback", () => {
    render(<ContactPage />);
    const emailLink = screen.getByText("contact@snapotter.com");
    expect(emailLink.closest("a")?.getAttribute("href")).toBe("mailto:contact@snapotter.com");
  });
});
