/**
 * Enhanced Emoji Popping Effect
 * Creates a beautiful burst of emojis with physics-based animations
 */

export const isOnlyEmoji = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Remove all whitespace
  const trimmed = text.trim();
  
  // Check if it's a single emoji (including compound emojis with modifiers and ZWJ sequences)
  const emojiRegex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/;
  
  return emojiRegex.test(trimmed) && trimmed.length <= 10; // Allow up to 10 characters to support complex emojis
};

export const createEmojiExplosion = (emoji, theme) => {
  const count = 50; // Number of emojis to create
  const container = document.body;
  
  // Create a container for all emojis
  const explosionContainer = document.createElement('div');
  explosionContainer.className = 'emoji-explosion-container';
  explosionContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `;
  
  container.appendChild(explosionContainer);
  
  // Create emojis with varied animations
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'emoji-pop';
    span.textContent = emoji;
    
    // Random properties for variety
    const size = 25 + Math.random() * 50; // 25-75px
    const startX = 20 + Math.random() * 60; // Start from 20-80% of screen width
    const rotation = Math.random() * 720 - 360; // -360 to 360 degrees
    const drift = (Math.random() - 0.5) * 40; // Horizontal drift -20 to 20vw
    const duration = 2.5 + Math.random() * 2; // 2.5-4.5 seconds
    const delay = Math.random() * 0.3; // Stagger the start
    const scale = 0.7 + Math.random() * 0.6; // Final scale 0.7-1.3
    
    // Create a glow color based on theme
    const glowColors = [
      'rgba(255, 100, 100, 0.8)',
      'rgba(100, 200, 255, 0.8)',
      'rgba(255, 200, 100, 0.8)',
      'rgba(200, 100, 255, 0.8)',
      'rgba(100, 255, 150, 0.8)',
      'rgba(255, 150, 200, 0.8)',
    ];
    const glowColor = glowColors[Math.floor(Math.random() * glowColors.length)];
    
    span.style.cssText = `
      position: absolute;
      left: ${startX}vw;
      bottom: -10vh;
      font-size: ${size}px;
      pointer-events: none;
      user-select: none;
      filter: drop-shadow(0 0 ${5 + Math.random() * 10}px ${glowColor});
      animation: floatUpExplosion ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards;
      --drift: ${drift}vw;
      --rotation: ${rotation}deg;
      --scale: ${scale};
      opacity: 0;
      transform-origin: center;
      z-index: ${Math.floor(Math.random() * 10)};
    `;
    
    explosionContainer.appendChild(span);
    
    // Remove after animation completes
    setTimeout(() => {
      span.remove();
    }, (duration + delay) * 1000 + 100);
  }
  
  // Clean up container after all animations complete
  setTimeout(() => {
    explosionContainer.remove();
  }, 5000);
};

// Add keyframes dynamically to the document
export const injectEmojiAnimationStyles = () => {
  const styleId = 'emoji-animation-styles';
  
  // Check if styles already exist
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes floatUpExplosion {
      0% {
        transform: translateY(0) translateX(0) scale(0.3) rotate(0deg);
        opacity: 0;
      }
      5% {
        opacity: 1;
      }
      20% {
        transform: translateY(-15vh) translateX(calc(var(--drift) * 0.2)) scale(0.8) rotate(calc(var(--rotation) * 0.3));
      }
      40% {
        transform: translateY(-35vh) translateX(calc(var(--drift) * 0.5)) scale(var(--scale)) rotate(calc(var(--rotation) * 0.6));
      }
      60% {
        transform: translateY(-60vh) translateX(calc(var(--drift) * 0.8)) scale(calc(var(--scale) * 1.1)) rotate(calc(var(--rotation) * 0.85));
        opacity: 1;
      }
      80% {
        transform: translateY(-85vh) translateX(var(--drift)) scale(calc(var(--scale) * 0.9)) rotate(var(--rotation));
        opacity: 0.8;
      }
      100% {
        transform: translateY(-105vh) translateX(calc(var(--drift) * 1.1)) scale(0.4) rotate(calc(var(--rotation) * 1.2));
        opacity: 0;
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        filter: drop-shadow(0 0 5px currentColor);
      }
      50% {
        filter: drop-shadow(0 0 15px currentColor);
      }
    }
    
    .emoji-pop {
      will-change: transform, opacity;
    }
    
    @media (prefers-reduced-motion: reduce) {
      .emoji-pop {
        animation: none !important;
        opacity: 0 !important;
      }
    }
  `;
  
  document.head.appendChild(style);
};
