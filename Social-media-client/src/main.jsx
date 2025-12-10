import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationSoundProvider } from "./context/NotificationSoundContext";
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
          <NotificationSoundProvider>
            <div onContextMenu={(e) => e.preventDefault()}>
              <App />
            </div>
          </NotificationSoundProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
