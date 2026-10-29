import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => { location.hash = ""; });

test("landing explains the project and offers the demo", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/existing C\+\+ paper-trading exchange/i);
  expect(screen.getByText(/written by someone else/i)).toBeInTheDocument();
  expect(screen.getByRole("table", { name: "Who wrote what" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Try the demo" })).toBeInTheDocument();
  expect(screen.getByText(/simulated or derived/i)).toBeInTheDocument();
});

test("demo is labelled as simulation and generated sample data is labelled as not live", async () => {
  location.hash = "demo";
  render(<App />);
  expect(screen.getAllByRole("note")[0]).toHaveTextContent(/Browser simulation/);
  expect(screen.getAllByRole("note")[1]).toHaveTextContent(/Generated demonstration data, not live/);
  for (const s of ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"]) expect(screen.getByRole("radio", { name: s })).toBeInTheDocument();
});

test("demo: buy fills, shows in portfolio and history; oversized and short orders are rejected", async () => {
  location.hash = "demo";
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "Send simulated order" }));
  expect(screen.getByRole("status")).toHaveTextContent(/Filled 5 of 5 AAPL/);
  const pos = screen.getByRole("table", { name: "Positions" });
  expect(within(pos).getByText("AAPL")).toBeInTheDocument();

  await user.selectOptions(screen.getByLabelText("Side"), "sell");
  await user.clear(screen.getByLabelText("Shares")); await user.type(screen.getByLabelText("Shares"), "6");
  await user.click(screen.getByRole("button", { name: "Send simulated order" }));
  expect(screen.getByRole("status")).toHaveTextContent(/Long-only/);

  await user.selectOptions(screen.getByLabelText("Side"), "buy");
  await user.clear(screen.getByLabelText("Shares")); await user.type(screen.getByLabelText("Shares"), "999");
  await user.click(screen.getByRole("button", { name: "Send simulated order" }));
  expect(screen.getByRole("status")).toHaveTextContent(/order limit/);
});

test("demo: switching stock changes the chart", async () => {
  location.hash = "demo";
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("radio", { name: "NVDA" }));
  expect(screen.getByRole("heading", { name: /NVDA synthetic price/ })).toBeInTheDocument();
});

test("research page is summary only and makes no skill claim", () => {
  location.hash = "research";
  render(<App />);
  expect(screen.getByText(/Two different questions/)).toBeInTheDocument();
  expect(screen.getByText(/No demonstrated predictive skill/)).toBeInTheDocument();
  expect(screen.queryByRole("table")).toBeNull();
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
