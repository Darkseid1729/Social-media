import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { CssBaseline } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import store from "./redux/store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <CssBaseline />
        <ThemeProvider>
        <div onContextMenu={(e) => e.preventDefault()}>
          <App />
        </div>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
