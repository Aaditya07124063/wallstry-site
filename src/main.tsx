import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

class Boundary extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? <div role="alert" className="fatal"><p>Something went wrong rendering this page.</p><button type="button" className="primary" onClick={() => location.reload()}>Reload</button></div> : this.props.children; }
}

createRoot(document.getElementById("root")!).render(<StrictMode><Boundary><App /></Boundary></StrictMode>);
