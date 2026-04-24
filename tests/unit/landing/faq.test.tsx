// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The FAQ page source imports from @/components/* which vitest resolves through
// the @ alias to apps/web/src/. These components only exist in the landing app,
// so we mock them at the resolved path vitest will look for.
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

const fetchMock = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ stargazers_count: 100 }),
});
vi.stubGlobal("fetch", fetchMock);

import FaqPage from "@landing/app/faq/page";

afterEach(cleanup);

describe("FaqPage", () => {
  it("renders the page heading", () => {
    render(<FaqPage />);
    expect(screen.getByText("Frequently Asked Questions")).toBeDefined();
  });

  it("renders the subtitle", () => {
    render(<FaqPage />);
    expect(screen.getByText("Everything you need to know about SnapOtter.")).toBeDefined();
  });

  it("renders all 8 FAQ questions", () => {
    render(<FaqPage />);
    expect(screen.getByText("Are my files safe and private?")).toBeDefined();
    expect(screen.getByText("Is SnapOtter really free?")).toBeDefined();
    expect(screen.getByText("Do I need an internet connection?")).toBeDefined();
    expect(screen.getByText("Are there any file size or usage limitations?")).toBeDefined();
    expect(screen.getByText("What AI features are included?")).toBeDefined();
    expect(screen.getByText("Does SnapOtter collect any analytics?")).toBeDefined();
    expect(screen.getByText("Can I use SnapOtter in my company?")).toBeDefined();
    expect(screen.getByText("How do I update SnapOtter?")).toBeDefined();
  });

  it("does not show answers by default", () => {
    render(<FaqPage />);
    expect(screen.queryByText(/All processing happens on your own server/)).toBeNull();
    expect(screen.queryByText(/open source under AGPL-3.0/)).toBeNull();
  });

  it("expands an answer when the question is clicked", () => {
    render(<FaqPage />);
    const question = screen.getByText("Are my files safe and private?");
    fireEvent.click(question);
    expect(screen.getByText(/All processing happens on your own server/)).toBeDefined();
  });

  it("collapses an answer when the question is clicked again", () => {
    render(<FaqPage />);
    const question = screen.getByText("Are my files safe and private?");
    fireEvent.click(question);
    expect(screen.getByText(/All processing happens on your own server/)).toBeDefined();
    fireEvent.click(question);
    expect(screen.queryByText(/All processing happens on your own server/)).toBeNull();
  });

  it("can have multiple FAQs open at the same time", () => {
    render(<FaqPage />);
    fireEvent.click(screen.getByText("Are my files safe and private?"));
    fireEvent.click(screen.getByText("Is SnapOtter really free?"));
    expect(screen.getByText(/All processing happens on your own server/)).toBeDefined();
    expect(screen.getByText(/open source under AGPL-3.0/)).toBeDefined();
  });

  it("renders the Navbar and Footer stubs", () => {
    render(<FaqPage />);
    expect(screen.getByTestId("navbar")).toBeDefined();
    expect(screen.getByTestId("footer")).toBeDefined();
  });
});
