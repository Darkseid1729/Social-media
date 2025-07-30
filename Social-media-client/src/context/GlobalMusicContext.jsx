import React, { createContext, useContext, useRef, useState } from "react";

const GlobalMusicContext = createContext();

export const useGlobalMusic = () => useContext(GlobalMusicContext);

export const GlobalMusicProvider = ({ children }) => {
  const [trackId, setTrackId] = useState(null);
  const [trackInfo, setTrackInfo] = useState(null);
  const audioRef = useRef();

  // Play a new track globally
  const playTrack = (id, info) => {
    setTrackId(id);
    setTrackInfo(info || null);
  };

  // Stop playback
  const stopTrack = () => {
    setTrackId(null);
    setTrackInfo(null);
  };

  const [expanded, setExpanded] = useState(false);
  const [showCloseZone, setShowCloseZone] = useState(false);
  // Helper to check if user is on home page
  const [isHome, setIsHome] = useState(typeof window !== "undefined" && window.location.pathname === "/");

  // Listen for route changes to update isHome
  React.useEffect(() => {
    const handleRouteChange = () => {
      setIsHome(typeof window !== "undefined" && window.location.pathname === "/");
    };
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("pushstate", handleRouteChange);
    window.addEventListener("replacestate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("pushstate", handleRouteChange);
      window.removeEventListener("replacestate", handleRouteChange);
    };
  }, []);

  return (
    <GlobalMusicContext.Provider value={{ trackId, trackInfo, playTrack, stopTrack }}>
      {children}
      {/* Drag-and-drop close zone at bottom */}
      {trackId && !expanded && showCloseZone && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 80,
            background: "rgba(40,40,40,0.95)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            id="close-zone"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#e74c3c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 32,
              fontWeight: 700,
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)"
            }}
          >✖</div>
        </div>
      )}
      {/* Single persistent iframe, toggled between collapsed and expanded view */}
      {trackId && (
        <>
          {/* Floating disc overlay for expand, draggable */}
          {!expanded && (
            <div
              draggable
              onDragStart={() => setShowCloseZone(true)}
              onDragEnd={e => {
                setShowCloseZone(false);
                // Check if dropped on close zone
                const closeZone = document.getElementById("close-zone");
                if (closeZone) {
                  const rect = closeZone.getBoundingClientRect();
                  const x = e.clientX;
                  const y = e.clientY;
                  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    stopTrack();
                  }
                }
              }}
              style={{
                position: "fixed",
                top: 80,
                right: 32,
                zIndex: 10000,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#1db954",
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
              onClick={() => setExpanded(true)}
              title={trackInfo?.name || "Open Music Player"}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Music" style={{ width: 48, height: 48 }} />
            </div>
          )}
          {/* Only one persistent iframe, styled for expanded/collapsed */}
          <div
            style={{
              position: "fixed",
              top: expanded ? 80 : undefined,
              right: expanded ? 32 : 32,
              width: expanded ? 360 : 80,
              height: expanded ? 120 : 80,
              zIndex: 9999,
              background: expanded ? "#181818" : "#1db954",
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              borderRadius: expanded ? "18px" : "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: expanded ? 12 : 0,
              transition: "all 0.3s"
            }}
          >
            {/* Overlay for click outside to collapse, only in expanded mode */}
            {expanded && (
              <div
                style={{
                  position: "fixed",
                  top: 80,
                  right: 32,
                  width: 360,
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#181818",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                  padding: "8px 0",
                  borderRadius: "18px",
                  zIndex: 9999
                }}
              >
                <button
                  onClick={stopTrack}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    border: "none",
                    borderRadius: "50%",
                    background: "#e74c3c",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    zIndex: 10001,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.18)"
                  }}
                  title="Close Player"
                >✖</button>
                <iframe
                  src={`https://open.spotify.com/embed/track/${trackId}?theme=dark`}
                  title="Spotify Player"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  style={{
                    width: 340,
                    height: 100,
                    borderRadius: "12px",
                    pointerEvents: "auto"
                  }}
                ></iframe>
              </div>
            )}
            {/* Collapsed mode: only show the iframe, styled as a disc */}
            {!expanded && (
              <iframe
                src={`https://open.spotify.com/embed/track/${trackId}?theme=dark`}
                title="Spotify Player"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  maxWidth: 80,
                  pointerEvents: "none"
                }}
              ></iframe>
            )}
          </div>
        </>
      )}
    </GlobalMusicContext.Provider>
  );
}
