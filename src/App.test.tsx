import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => { location.hash = ""; });

test("landing explains the project and offers the demo", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Hardening a C\+\+ exchange/i);
  expect(screen.getAllByText(/written by someone else/i).length).toBeGreaterThan(0);
  expect(screen.getByRole("table", { name: "Who wrote what" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Open trading workspace" })).toBeInTheDocument();
  expect(screen.getAllByText(/not investment advice/i).length).toBeGreaterThan(0);
});

test("demo is labelled as simulation and generated sample data is labelled as not live", async () => {
  location.hash = "demo";
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getAllByRole("note")[0]).toHaveTextContent(/Browser simulation/);
  expect(screen.getAllByRole("note")[0]).toHaveTextContent(/not the C\+\+ exchange and not market data/);
  for (const s of ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"]) expect(screen.getByRole("radio", { name: s })).toBeInTheDocument();
  await user.click(screen.getByRole("tab", { name: "Scripted sample" }));
  expect(screen.getAllByRole("note")[1]).toHaveTextContent(/Generated demonstration data, not live/);
});

test("demo: orders produce status feedback, history, executions and positions; bad orders are rejected", async () => {
  location.hash = "demo";
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole("status")).toHaveTextContent(/No orders yet/);
  await user.click(screen.getByRole("button", { name: "Send simulated order" }));
  expect(screen.getByRole("status")).toHaveTextContent(/Filled/);
  expect(screen.getByRole("status")).toHaveTextContent(/BUY 5 AAPL/);
  expect(within(screen.getByRole("table", { name: "Positions" })).getByText("AAPL")).toBeInTheDocument();

  await user.click(screen.getByRole("radio", { name: "Sell" }));
  await user.clear(screen.getByLabelText("Shares")); await user.type(screen.getByLabelText("Shares"), "6");
  expect(screen.getByText(/Would be rejected: Long-only/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Send simulated order" }));
  expect(screen.getByRole("status")).toHaveTextContent(/Rejected: Long-only/);

  await user.click(screen.getByRole("radio", { name: "Buy" }));
  await user.clear(screen.getByLabelText("Shares")); await user.type(screen.getByLabelText("Shares"), "999");
  await user.click(screen.getByRole("button", { name: "Send simulated order" }));
  expect(screen.getByRole("status")).toHaveTextContent(/order limit/);

  await user.click(screen.getByRole("tab", { name: /Orders/ }));
  const orders = screen.getByRole("table", { name: /Order history/ });
  expect(within(orders).getByText("Filled", { selector: ".badge" })).toBeInTheDocument();
  expect(within(orders).getAllByText("Rejected")).toHaveLength(2);
  await user.click(screen.getByRole("tab", { name: /Executions/ }));
  expect(within(screen.getByRole("table", { name: /executions/ })).getAllByRole("row").length).toBeGreaterThan(1);
});

test("demo: unfilled limit order is cancelled; reset clears the session", async () => {
  location.hash = "demo";
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("radio", { name: "Limit (IOC)" }));
  await user.type(screen.getByLabelText("Limit price"), "1");
  await user.click(screen.getByRole("button", { name: "Send simulated order" }));
  expect(screen.getByRole("status")).toHaveTextContent(/Cancelled/);
  await user.click(screen.getByRole("button", { name: "Reset demo" }));
  expect(screen.getByRole("status")).toHaveTextContent(/No orders yet/);
});

test("demo: switching stock changes the chart; stepping advances the day", async () => {
  location.hash = "demo";
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("radio", { name: "NVDA" }));
  expect(screen.getByRole("heading", { name: /NVDA · synthetic price/ })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /NVDA synthetic candlestick/ })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Next day" }));
  expect(screen.getByRole("heading", { name: /day 0 to 201/ })).toBeInTheDocument();
});

test("demo: chart keyboard inspection updates the OHLC readout", async () => {
  location.hash = "demo";
  const user = userEvent.setup();
  render(<App />);
  const before = screen.getByTestId("ohlc").textContent;
  screen.getByRole("img", { name: /candlestick/ }).focus();
  await user.keyboard("{ArrowLeft}{ArrowLeft}");
  expect(screen.getByTestId("ohlc").textContent).not.toBe(before);
});

test("architecture and engineering pages distinguish upstream from my work", () => {
  location.hash = "architecture";
  const { unmount } = render(<App />);
  expect(screen.getByRole("img", { name: /Exchange pipeline/ })).toBeInTheDocument();
  expect(screen.getAllByText("Upstream, unchanged").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Written by me").length).toBeGreaterThan(0);
  unmount();
  location.hash = "engineering";
  render(<App />);
  expect(screen.getByRole("table", { name: /Engineering changes by phase/ })).toBeInTheDocument();
});

test("every page renders and nav marks the current one", () => {
  for (const p of ["home", "demo", "research", "architecture", "engineering", "about"]) {
    location.hash = p;
    const { unmount } = render(<App />);
    expect(screen.getByRole("link", { current: "page" })).toBeInTheDocument();
    unmount();
  }
});

test("skip link focuses main without leaving the current page", async () => {
  location.hash = "research";
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("link", { name: "Skip to content" }));
  expect(document.activeElement).toBe(screen.getByRole("main"));
  expect(location.hash).toBe("#research");
});

test("public research page withholds figures and still states the conclusion", () => {
  location.hash = "research";
  render(<App />);
  expect(screen.getByText(/Figures withheld/)).toBeInTheDocument();
  expect(screen.getByText(/No predictive skill was demonstrated/)).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(/\d+\.\d+%/);
});

test("menu button toggles the navigation and Escape closes it", async () => {
  location.hash = "home";
  const user = userEvent.setup();
  render(<App />);
  const button = screen.getByRole("button", { name: /Menu/ });
  expect(button).toHaveAttribute("aria-expanded", "false");
  await user.click(button);
  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("navigation", { name: "Main" })).toHaveClass("open");
  await user.keyboard("{Escape}");
  expect(button).toHaveAttribute("aria-expanded", "false");
});

test("text table cells carry their column header for the phone card layout", () => {
  location.hash = "engineering";
  render(<App />);
  const cells = document.querySelectorAll("table.txt td[data-label]");
  expect(cells.length).toBeGreaterThan(0);
  expect(document.querySelectorAll("table.cards td[data-label]").length).toBeGreaterThan(0);
});
