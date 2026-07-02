import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "var(--font-sans)",
        }}>
          <h1 style={{ fontSize: "1.5rem", color: "#ef4444", marginBottom: "1rem" }}>
            Algo salió mal
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
            {this.state.error?.message || "Error inesperado"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Volver al inicio
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
