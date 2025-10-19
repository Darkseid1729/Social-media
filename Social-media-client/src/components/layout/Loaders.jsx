import { Grid, Skeleton, Stack, Box, CircularProgress } from "@mui/material";
import React, { useMemo, useState, useEffect } from "react";
import { BouncingSkeleton } from "../styles/StyledComponents";
import { keyframes } from "@mui/system";

const LayoutLoader = () => {
  return (
    <Grid container height={"calc(100vh - 4rem)"} spacing={"1rem"}>
      <Grid
        item
        sm={4}
        md={3}
        sx={{
          display: { xs: "none", sm: "block" },
        }}
        height={"100%"}
      >
        <Skeleton variant="rectangular" height={"100vh"} />
      </Grid>
      <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}>
        <Stack spacing={"1rem"}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={"5rem"} />
          ))}
        </Stack>
      </Grid>

      <Grid
        item
        md={4}
        lg={3}
        height={"100%"}
        sx={{
          display: { xs: "none", md: "block" },
        }}
      >
        <Skeleton variant="rectangular" height={"100vh"} />
      </Grid>
    </Grid>
  );
};

// Loader Style 1: Centered Spinner




// Loader Style 4: Grid Pattern
const GridPatternLoader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Grid container spacing={1} sx={{ width: "150px" }}>
        {Array.from({ length: 9 }).map((_, index) => (
          <Grid item xs={4} key={index}>
            <BouncingSkeleton
              variant="rectangular"
              width={40}
              height={40}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Loader Style 5: Concentric Circles
const ConcentricCirclesLoader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        position: "relative",
      }}
    >
      {[80, 60, 40].map((size, index) => (
        <BouncingSkeleton
          key={index}
          variant="circular"
          width={size}
          height={size}
          style={{
            position: "absolute",
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </Box>
  );
};

// Loader Style 6: Alternating Circle Spin (15 concentric circles)
const AlternatingCircleSpinLoader = () => {
  const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;

  const circles = Array.from({ length: 15 }, (_, i) => {
    const size = 300 - i * 20;
    const top = i * 10;
    const opacity = 1 - i * 0.05;
    const delay = -5 + i * 0.1;

    return (
      <Box
        key={i}
        sx={{
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          top: `${top}px`,
          left: `${top}px`,
          border: "5px solid",
          borderColor: `rgba(163,207,213, ${opacity})`,
          borderTop: "0 solid transparent",
          borderLeft: "0 solid transparent",
          borderRadius: "50%",
          boxSizing: "border-box",
          animation: `${spin} 4s linear infinite alternate`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ width: "300px", height: "300px", position: "relative" }}>
        {circles}
      </Box>
    </Box>
  );
};

// Loader Style 7: Balloon Loader (balloon aligned above "I")
const BalloonLoader = () => {
  const blow = keyframes`
    0% { transform: scale(0.5) translateY(50%); }
    20% { transform: scale(0.6) translateY(33%); }
    40% { transform: scale(0.7) translateY(21%); }
    60% { transform: scale(0.8) translateY(12%); }
    80% { transform: scale(0.9) translateY(5%); }
    93%, 100% { transform: scale(1) translateY(0) translateZ(0); }
  `;

  const letterSize = 56; // base cell width for alignment
  const textColor = "#ff1ead";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: { xs: "100dvh", sm: "100vh" },
        width: "100vw",
        bgcolor: "#000",
        position: "fixed",
        inset: 0,
        zIndex: 1300,
      }}
    >
      {/* Grid: 2 rows (balloon row, letters row) and 7 equal columns */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: `repeat(7, 32px)`, sm: `repeat(7, ${letterSize}px)` },
          gridTemplateRows: { xs: "70px auto", sm: "140px auto" },
          columnGap: { xs: "6px", sm: "16px" },
          alignItems: "end",
          justifyItems: "center",
        }}
      >
        {/* Balloon column: place in column 5 (above I) */}
        <Box sx={{ gridColumn: 5, gridRow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
          {/* Balloon */}
          <Box
            sx={{
              position: "relative",
              width: { xs: "48px", sm: "120px" },
              height: { xs: "48px", sm: "120px" },
              bgcolor: textColor,
              borderRadius: "50%",
              transform: "scale(0.5) translateY(50%)",
              animation: `${blow} 1.6s linear alternate infinite`,
              outline: "1px solid transparent",
            }}
          >
            {/* Large shine */}
            <Box
              sx={{
                position: "absolute",
                width: { xs: "12px", sm: "30px" },
                height: { xs: "24px", sm: "60px" },
                bgcolor: "white",
                borderRadius: "100% 50% 40% 100% / 50% 30% 30% 100%",
                top: "15%",
                left: "20%",
                transform: "rotateZ(60deg)",
              }}
            />
            {/* Small shine */}
            <Box
              sx={{
                position: "absolute",
                width: { xs: "6px", sm: "12px" },
                height: { xs: "6px", sm: "12px" },
                bgcolor: "white",
                borderRadius: "50%",
                top: "45%",
                left: "15%",
              }}
            />
            {/* Balloon knot */}
            <Box
              sx={{
                position: "absolute",
                bottom: { xs: "-3px", sm: "-8px" },
                left: "50%",
                transform: "translateX(-50%)",
                width: { xs: "3px", sm: "8px" },
                height: { xs: "3px", sm: "8px" },
                bgcolor: "#cc1389",
                borderRadius: "50%",
              }}
            />
          </Box>
          {/* String/Rope */}
          <Box sx={{ width: { xs: "1px", sm: "2px" }, height: { xs: "16px", sm: "40px" }, bgcolor: textColor, opacity: 0.8 }} />
        </Box>

        {/* Letters row */}
        <Box sx={{ gridRow: 2, gridColumn: 1, fontSize: { xs: "22px", sm: "48px" }, fontWeight: "bold", fontFamily: "Arial, sans-serif", color: textColor }}>L</Box>
        <Box sx={{ gridRow: 2, gridColumn: 2, fontSize: { xs: "28px", sm: "56px" }, fontWeight: "bold", fontFamily: "Arial, sans-serif", color: textColor }}>O</Box>
        <Box sx={{ gridRow: 2, gridColumn: 3, fontSize: { xs: "22px", sm: "48px" }, fontWeight: "bold", fontFamily: "Arial, sans-serif", color: textColor }}>△</Box>
        <Box sx={{ gridRow: 2, gridColumn: 4, fontSize: { xs: "28px", sm: "56px" }, fontWeight: "bold", fontFamily: "Arial, sans-serif", color: textColor }}>D</Box>
        {/* I represented by a square block */}
        <Box sx={{ gridRow: 2, gridColumn: 5, fontSize: { xs: "22px", sm: "48px" }, fontWeight: "bold", fontFamily: "Arial, sans-serif", color: textColor }}> ▌</Box>
        <Box sx={{ gridRow: 2, gridColumn: 6, fontSize: { xs: "22px", sm: "48px" }, fontWeight: "bold", fontFamily: "Arial, sans-serif", color: textColor }}>N</Box>
        <Box
          sx={{
            gridRow: 2,
            gridColumn: 7,
            fontSize: { xs: "22px", sm: "48px" },
            border: { xs: `1.5px solid ${textColor}`, sm: `3px solid ${textColor}` },
            borderRadius: "50%",
            width: { xs: "22px", sm: "48px" },
            height: { xs: "22px", sm: "48px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontFamily: "Arial, sans-serif",
          }}
        >
          G
        </Box>
      </Box>
    </Box>
  );
};

// Loader Style 8: Pong Game Loader
const PongGameLoader = () => {
  const movePaddleOne = keyframes`
    0%, 100% { transform: translate(0px, 100px); }
    25% { transform: translate(0px, 0px); }
    50% { transform: translate(0px, 0px); }
    75% { transform: translate(0px, 100px); }
  `;

  const movePaddleTwo = keyframes`
    0%, 100% { transform: translate(0px, -50px); }
    25% { transform: translate(0px, 10px); }
    50% { transform: translate(0px, 0px); }
    75% { transform: translate(0px, 50px); }
  `;

  const moveBall = keyframes`
    0%, 100% { transform: translate(-180px, 30px); }
    25% { transform: translate(18px, -25px); }
    50% { transform: translate(-180px, -55px); }
    75% { transform: translate(18px, 15px); }
  `;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: { xs: "100dvh", sm: "100vh" },
        width: "100vw",
        bgcolor: "#56c8d8",
        overflow: "visible",
      }}
    >
      <Box sx={{ position: "relative", width: "200px", height: "150px", mx: "auto" }}>
        {/* Stage: shift coordinate system to include negative-left elements */}
        <Box sx={{ position: "absolute", inset: 0, left: "180px" }}>
          {/* Player One Paddle */}
          <Box
            sx={{
              position: "absolute",
              height: "40px",
              width: "3px",
              bgcolor: "white",
              left: "-180px",
              top: "calc(50% - 52px)",
              animation: `${movePaddleOne} 4s infinite`,
            }}
          />
          {/* Player Two Paddle */}
          <Box
            sx={{
              position: "absolute",
              height: "40px",
              width: "3px",
              bgcolor: "white",
              left: "20px",
              top: "calc(50% - 64px)",
              animation: `${movePaddleTwo} 4s infinite`,
            }}
          />
          {/* Ball */}
          <Box
            sx={{
              position: "absolute",
              height: "5px",
              width: "5px",
              borderRadius: "50%",
              bgcolor: "white",
              top: "calc(50% - 2.5px)",
              animation: `${moveBall} 4s infinite linear`,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

// Loader Style 9: Helix DNA Loader
const HelixLoader = () => {
  const movement = keyframes`
    0% { transform: translate3d(0, -25px, 0); z-index: 0; }
    50% { transform: translate3d(0, 25px, 0); z-index: 10; }
    100% { transform: translate3d(0, -25px, 0); z-index: -5; }
  `;

  const sizeOpacity = keyframes`
    0% { opacity: 1; transform: scale(1); }
    25% { transform: scale(1.5); }
    50% { opacity: 1; }
    75% { opacity: 0.35; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  `;

  const dotCount = 26;
  const dotSize = 10;
  const dotSpace = 15;
  const animationDistance = 25;
  
  // Calculate the starting position (center point)
  const dotStart = ((dotCount / 2 + 1) * (dotSize + dotSpace)) / 2;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: { xs: "100dvh", sm: "100vh" },
        width: "100vw",
        background: "linear-gradient(45deg, #d65b9e 1%, #f699cb 22%, #ffacd9 51%, #f699cb 83%, #d65b9e 100%)",
        overflow: "hidden",
        position: "fixed",
        inset: 0,
        zIndex: 1300,
      }}
    >
      <Box sx={{
        position: "relative",
        height: { xs: "48px", sm: "100px" },
        width: { xs: "180px", sm: "auto" },
        left: { xs: "calc(50vw - 90px)", sm: "auto" },
      }}>
        {Array.from({ length: dotCount }).map((_, i) => {
          // SCSS logic: $dot-move: ceil($i / 2);
          const index = i + 1; // Convert to 1-based index like SCSS
          const dotMove = Math.ceil(index / 2);
          
          // SCSS logic: $dot-pos: $dot-start - (($dot-size + $dot-space) * $dot-move);
          const dotPos = dotStart - ((dotSize + dotSpace) * dotMove);
          
          // SCSS animation delay logic
          let animationDelay;
          if (index % 2 === 0) {
            // Even: -#{($i * .1) + ($animation-time / 2)}s = -(i * 0.1 + 1)s
            animationDelay = -((index * 0.1) + 1);
          } else {
            // Odd: -#{$i * .1}s
            animationDelay = -(index * 0.1);
          }
          
          // Check if even for color (SCSS uses :nth-of-type(even))
          const isEven = index % 2 === 0;

          return (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                left: `${dotPos}px`,
                top: `-${dotSize}px`,
                transform: `translate3d(0, -${animationDistance}px, 0) scale(1)`,
                animation: `${movement} 2s ease-in-out infinite`,
                animationDelay: `${animationDelay}s`,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  bgcolor: isEven ? "#ff47aa" : "white",
                  borderRadius: "50%",
                  boxShadow: isEven ? "inset 0 0 4px #e6298f" : "none",
                  animation: `${sizeOpacity} 2s ease infinite`,
                  animationDelay: `${animationDelay}s`,
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Loader Style 10: Lightsaber Fight Loader
const LightsaberLoader = () => {
  const showlightgreen = keyframes`
    0% { max-height: 0; box-shadow: 0 0 0 0 #87c054; }
    5% { box-shadow: 0 0 4px 2px #87c054; }
    10% { max-height: 22px; }
    80% { max-height: 22px; }
    85% { box-shadow: 0 0 4px 2px #87c054; }
    100% { max-height: 0; box-shadow: 0 0 0 0 #87c054; }
  `;

  const showlightred = keyframes`
    0% { max-height: 0; box-shadow: 0 0 0 0 #f06363; }
    20% { box-shadow: 0 0 4px 2px #f06363; }
    25% { max-height: 22px; }
    80% { max-height: 22px; }
    85% { box-shadow: 0 0 4px 2px #f06363; }
    100% { max-height: 0; box-shadow: 0 0 0 0 #f06363; }
  `;

  const fightleft = keyframes`
    0% { transform: rotateZ(0deg); left: 0; bottom: 0; }
    30% { transform: rotateZ(0deg); bottom: 0; }
    40% { transform: rotateZ(45deg); left: 0; bottom: 2px; }
    45% { transform: rotateZ(65deg); left: 0; }
    65% { transform: rotateZ(410deg); left: 30px; bottom: 10px; }
    95% { transform: rotateZ(410deg); left: 0; bottom: 0; }
    100% { transform: rotateZ(360deg); left: 0; bottom: 0; }
  `;

  const fightright = keyframes`
    0% { transform: rotateZ(0deg); right: 0; bottom: 0; }
    30% { transform: rotateZ(0deg); bottom: 0; }
    45% { transform: rotateZ(-45deg); right: 0; bottom: 2px; }
    50% { transform: rotateZ(-65deg); right: 0; }
    68% { transform: rotateZ(-410deg); right: 27px; bottom: 13px; }
    95% { transform: rotateZ(-410deg); right: 0; bottom: 0; }
    100% { transform: rotateZ(-360deg); right: 0; bottom: 0; }
  `;

  const particles1 = keyframes`
    0% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(35deg) translateY(0px); }
    63% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(35deg) translateY(0px); }
    64% { background-color: rgba(51, 51, 51, 1); transform: rotateZ(35deg) translateY(0px); }
    100% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(35deg) translateY(-30px); }
  `;

  const particles2 = keyframes`
    0% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-65deg) translateY(0px); }
    63% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-65deg) translateY(0px); }
    64% { background-color: rgba(51, 51, 51, 1); transform: rotateZ(-65deg) translateY(0px); }
    95% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-65deg) translateY(-40px); }
    100% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-65deg) translateY(-40px); }
  `;

  const particles3 = keyframes`
    0% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-75deg) translateY(0px); }
    63% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-75deg) translateY(0px); }
    64% { background-color: rgba(51, 51, 51, 1); transform: rotateZ(-75deg) translateY(0px); }
    97% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-75deg) translateY(-35px); }
    100% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-75deg) translateY(-35px); }
  `;

  const particles4 = keyframes`
    0% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-25deg) translateY(0px); }
    63% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-25deg) translateY(0px); }
    64% { background-color: rgba(51, 51, 51, 1); transform: rotateZ(-25deg) translateY(0px); }
    97% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-25deg) translateY(-30px); }
    100% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(-25deg) translateY(-30px); }
  `;

  const particles5 = keyframes`
    0% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(65deg) translateY(0px); }
    63% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(65deg) translateY(0px); }
    64% { background-color: rgba(51, 51, 51, 1); transform: rotateZ(65deg) translateY(0px); }
    97% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(65deg) translateY(-35px); }
    100% { background-color: rgba(51, 51, 51, 0); transform: rotateZ(65deg) translateY(-35px); }
  `;

  const particleAnimations = [particles1, particles2, particles3, particles4, particles5];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        bgcolor: "#eee",
      }}
    >
      <Box 
        sx={{ 
          position: "relative", 
          width: "80px", 
          height: "40px",
        }}
      >
        {/* Particles */}
        {particleAnimations.map((anim, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              left: "42px",
              top: "10px",
              width: "1px",
              height: "5px",
              backgroundColor: "rgba(51, 51, 51, 0)",
              animation: `${anim} 2s ease-out infinite 1s`,
            }}
          />
        ))}

        {/* Left Lightsaber (Green) */}
        <Box
          sx={{
            position: "absolute",
            width: "4px",
            height: "12px",
            bgcolor: "#666",
            borderRadius: "1px",
            bottom: 0,
            left: 0,
            animation: `${fightleft} 2s ease-in-out infinite 1s`,
            "&::before": {
              content: '""',
              position: "absolute",
              display: "block",
              width: "2px",
              height: "25px",
              maxHeight: "1px",
              left: "1px",
              top: "1px",
              bgcolor: "#fff",
              borderRadius: "1px",
              transform: "rotateZ(180deg)",
              transformOrigin: "center top",
              animation: `${showlightgreen} 2s ease-in-out infinite 1s`,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              display: "block",
              width: "2px",
              height: "2px",
              left: "1px",
              top: "4px",
              bgcolor: "#fff",
              borderRadius: "50%",
            },
          }}
        />

        {/* Right Lightsaber (Red) */}
        <Box
          sx={{
            position: "absolute",
            width: "4px",
            height: "12px",
            bgcolor: "#666",
            borderRadius: "1px",
            bottom: 0,
            right: 0,
            animation: `${fightright} 2s ease-in-out infinite 1s`,
            "&::before": {
              content: '""',
              position: "absolute",
              display: "block",
              width: "2px",
              height: "25px",
              maxHeight: "1px",
              left: "1px",
              top: "1px",
              bgcolor: "#fff",
              borderRadius: "1px",
              transform: "rotateZ(180deg)",
              transformOrigin: "center top",
              animation: `${showlightred} 2s ease-in-out infinite 1s`,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              display: "block",
              width: "2px",
              height: "2px",
              left: "1px",
              top: "4px",
              bgcolor: "#fff",
              borderRadius: "50%",
            },
          }}
        />
      </Box>
    </Box>
  );
};

// Loader Style 11: Triple Spinner (Nested Circles)
const TripleSpinnerLoader = () => {
  const spinLeft = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(720deg); }
  `;

  const spinRight = keyframes`
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  `;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        bgcolor: "#FC6042",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "80px",
          height: "80px",
          borderRight: "4px solid #ffffff",
          borderRadius: "100%",
          animation: `${spinRight} 800ms linear infinite`,
        }}
      >
        {/* Middle circle */}
        <Box
          sx={{
            content: '""',
            position: "absolute",
            width: "60px",
            height: "60px",
            top: "calc(50% - 30px)",
            left: "calc(50% - 30px)",
            borderLeft: "3px solid #ffffff",
            borderRadius: "100%",
            animation: `${spinLeft} 800ms linear infinite`,
          }}
        />
        {/* Inner circle */}
        <Box
          sx={{
            content: '""',
            position: "absolute",
            width: "40px",
            height: "40px",
            top: "calc(50% - 20px)",
            left: "calc(50% - 20px)",
            borderRight: "2px solid #ffffff",
            borderRadius: "100%",
          }}
        />
      </Box>
    </Box>
  );
};

// Random Loader: shows a random loader every interval
const RandomLoader = ({ intervalMs = 3000 }) => {
  const loaders = [
    LayoutLoader,
    GridPatternLoader,
    ConcentricCirclesLoader,
    AlternatingCircleSpinLoader,
    BalloonLoader,
    PongGameLoader,
    HelixLoader,
    LightsaberLoader,
    TripleSpinnerLoader,
  ];

  const [index, setIndex] = useState(() => Math.floor(Math.random() * loaders.length));

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(prev => {
        let next;
        do {
          next = Math.floor(Math.random() * loaders.length);
        } while (next === prev && loaders.length > 1);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, loaders.length]);

  const Selected = loaders[index];
  return typeof Selected === "function" ? <Selected /> : null;
};

const TypingLoader = () => {
  return (
    <Stack
      spacing={"0.5rem"}
      direction={"row"}
      padding={"0.5rem"}
      justifyContent={"center"}
    >
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.1s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.2s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.4s",
        }}
      />
      <BouncingSkeleton
        variant="circular"
        width={15}
        height={15}
        style={{
          animationDelay: "0.6s",
        }}
      />
    </Stack>
  );
};

export { TypingLoader, LayoutLoader, RandomLoader };
