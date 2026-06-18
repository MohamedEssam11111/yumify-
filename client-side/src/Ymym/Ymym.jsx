import React, { useState, useEffect, useMemo } from "react";
import chefHatImg from "./chef-hat.png";
import leftHandImg from "./left-hand.png";
import rightHandImg from "./right-hand.png";
import bodyImg from "./body.png";
import headImg from "./head.png";
import openEyesImg from "./open-eyes.png";
import closeEyesImg from "./close-eyes.png";

// Default layout and offsets config so that designers can override
const DEFAULT_RIG = {
  // Body configurations (baseline reference at the bottom-middle of mascot container)
  bodyStyle: {
    left: "50%",
    bottom: "5%",
    width: "68%",
  },
  // Head sits on top of the body
  headStyle: {
    left: "50%",
    bottom: "30%",
    width: "62%",
  },
  // Chef hat sits on top of the head
  chefHatStyle: {
    left: "50%",
    bottom: "45%",
    width: "92%", // approx 150% of head width
  },
  // Left hand attached to left shoulder
  leftHandStyle: {
    left: "8%",
    bottom: "15%",
    width: "32%",
  },
  // Right hand attached to right shoulder
  rightHandStyle: {
    right: "8%",
    bottom: "15%",
    width: "32%",
  },
  // Eyes centered naturally inside head visor
  eyesStyle: {
    left: "50%",
    top: "38%",
    width: "64%",
  },
};

const MESSAGES = [
  "Hi! I'm Ymym 👋",
  "Need help choosing food?",
  "Welcome to Yumify!",
  "Looking for something delicious? 🍔",
  "Need help with your order?",
  "I'm here if you need me 😊",
];

export default function Ymym({
  children,
  position = "right",
  size = "md",
  scale = 1,

  // Wrapper/Mascot-specific transform props
  wrapperPosition = { x: 0, y: 0 },
  wrapperScale = 1,
  wrapperRotate = 0,

  // Default values resolved inline or via destructuring
  headSize = 1,
  headRotate = 0,
  headPosition = { x: 0, y: 0 },

  bodySize = 1,
  bodyRotate = 0,
  bodyPosition = { x: 0, y: 0 },

  chefHatSize = 1,
  chefHatRotate = 0,
  chefHatPosition = { x: 0, y: 0 },

  leftHandSize = 1,
  leftHandRotate = 0,
  leftHandPosition = { x: 0, y: 0 },

  rightHandSize = 1,
  rightHandRotate = 0,
  rightHandPosition = { x: 0, y: 0 },

  openEyesSize = 1,
  openEyesRotate = 0,
  openEyesPosition = { x: 0, y: 0 },

  closeEyesSize = 1,
  closeEyesRotate = 0,
  closeEyesPosition = { x: 0, y: 0 },
  onClick = () => {},
  debug = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState("");
  const [eyesOpen, setEyesOpen] = useState(true);
  const [isNodding, setIsNodding] = useState(false);

  // Responsive container classes
  // Standard sizing in pixels for absolute container references
  const sizePixels = useMemo(() => {
    switch (size) {
      case "sm":
        return 90;
      case "lg":
        return 150;
      case "md":
      default:
        return 120;
    }
  }, [size]);

  // Handle Blinking loop
  useEffect(() => {
    let blinkTimeout;
    let nextBlinkTimeout;

    const scheduleBlink = () => {
      // Blink interval: 4-7 seconds
      const delay = Math.random() * 3000 + 4000;
      nextBlinkTimeout = setTimeout(() => {
        setEyesOpen(false); // close eyes
        blinkTimeout = setTimeout(() => {
          setEyesOpen(true); // open eyes
          scheduleBlink();
        }, 120); // wait 120ms
      }, delay);
    };

    scheduleBlink();

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(nextBlinkTimeout);
    };
  }, []);

  // Handle Extra Life head nod loop
  useEffect(() => {
    let nodTimer;

    const scheduleNod = () => {
      // Nod interval: 10-15 seconds
      const delay = Math.random() * 5000 + 10000;
      nodTimer = setTimeout(() => {
        setIsNodding(true);
        setTimeout(() => {
          setIsNodding(false);
          scheduleNod();
        }, 600); // 0.6s duration
      }, delay);
    };

    scheduleNod();

    return () => {
      clearTimeout(nodTimer);
    };
  }, []);

  // Handle hovering start (generates random message)
  const handleMouseEnter = () => {
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setSpeechBubbleText(randomMsg);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Combining user-provided offset/rotations and scales
  // Formula: Final Scale = Global Scale * Individual Asset Scale
  const combinedBodyTransform = `translate(${bodyPosition.x}px, ${bodyPosition.y}px) rotate(${bodyRotate}deg) scale(${bodySize * scale})`;

  // Nod rotates the head slightly by 5deg extra during animation
  const currentHeadRotate =
    headRotate + (isNodding ? 5 : 0) + (isHovered ? 4 : 0);
  const combinedHeadTransform = `translate(${headPosition.x}px, ${headPosition.y}px) rotate(${currentHeadRotate}deg) scale(${headSize * scale})`;

  const combinedChefHatTransform = `translate(${chefHatPosition.x}px, ${chefHatPosition.y}px) rotate(${chefHatRotate}deg) scale(${chefHatSize * scale})`;
  const combinedLeftHandTransform = `translate(${leftHandPosition.x}px, ${leftHandPosition.y}px) rotate(${leftHandRotate}deg) scale(${leftHandSize * scale})`;

  // Right hand waves during hover
  const combinedRightHandTransform = `translate(${rightHandPosition.x}px, ${rightHandPosition.y}px) rotate(${rightHandRotate}deg) scale(${rightHandSize * scale})`;

  // Eyes scale up slightly on hover (scale * 1.1)
  const eyesScaleFactor = isHovered ? 1.1 : 1.0;
  const combinedOpenEyesTransform = `translate(${openEyesPosition.x}px, ${openEyesPosition.y}px) rotate(${openEyesRotate}deg) scale(${openEyesSize * scale * eyesScaleFactor})`;
  const combinedCloseEyesTransform = `translate(${closeEyesPosition.x}px, ${closeEyesPosition.y}px) rotate(${closeEyesRotate}deg) scale(${closeEyesSize * scale})`;

  return (
    <div
      id="ymym-outer-wrapper"
      className="fixed inline-block transition-transform duration-300 group bottom-[72px] right-16 md:bottom-24 md:right-16 "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Wrapped child button / content remains 100% clickable */}
      <div id="ymym-wrapped-child" className="relative z-20">
        {children}
      </div>

      {/* Mascot Graphics Layer Container */}
      <div
        id="ymym-mascot-container"
        className={`absolute pointer-events-auto z-10 transition-all duration-300  ${
          position === "right"
            ? "bottom-full right-0 translate-x-1/4 translate-y-3 sm:translate-y-4"
            : "bottom-full left-0 -translate-x-1/4 translate-y-3 sm:translate-y-4"
        }`}
        style={{
          width: `${sizePixels}px`,
          height: `${sizePixels}px`,
        }}
      >
        <div
          id="ymym-mascot-transform-layer"
          className="relative w-full h-full pointer-events-auto z-51 "
          style={{
            transform: `translate(${wrapperPosition?.x ?? 0}px, ${wrapperPosition?.y ?? 0}px) rotate(${wrapperRotate ?? 0}deg) scale(${wrapperScale ?? 1})`,
            transformOrigin: "bottom center",
          }}
        >
          {/* Welcome Speech Bubble */}
          {isHovered && speechBubbleText && (
            <div
              id="ymym-speech-bubble"
              className="absolute  bottom-[150px] mb-3 right-[-70px] -translate-x-1/2 bg-white text-slate-800 text-xs sm:text-sm font-semibold py-2 px-3 rounded-2xl shadow-xl border border-orange-100 animate-bubble-in whitespace-nowrap pointer-events-auto "
              style={{
                zIndex: 202,
                rotate: "-15deg",
              }}
            >
              {speechBubbleText}
              {/* Tail */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-white border-b border-r border-orange-100 rotate-45 pointer-events-none" />
            </div>
          )}

          {/* Mascot Graphics Wrapper (Supports Horizontal Flipping/Mirroring when Position is Left) */}
          <div
            id="ymym-sprites-wrapper"
            className={`relative w-full h-full animate-ymym-float ${
              position === "left" ? "scale-x-[-1]" : ""
            }`}
          >
            {/* 1. CHEF HAT (z-index 10) */}
            <div
              id="layer-chef-hat"
              className="absolute -translate-x-1/2 animate-ymym-hat pointer-events-auto cursor-pointer"
              style={{
                ...DEFAULT_RIG.chefHatStyle,
                transformOrigin: "bottom center",
                zIndex: 51,
              }}
            >
              <img
                src={chefHatImg}
                referrerPolicy="no-referrer"
                alt="Chef Hat"
                className={`w-full h-auto select-none pointer-events-auto transition-shadow duration-300 bg-transparent mix-blend-multiply ${
                  debug ? "outline-2 outline-dashed outline-pink-500" : ""
                }`}
                style={{
                  transform: combinedChefHatTransform,
                }}
              />
            </div>

            {/* 2. LEFT HAND (z-index 20) */}
            <div
              id="layer-left-hand"
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                ...DEFAULT_RIG.leftHandStyle,
                transformOrigin: "bottom right",
                zIndex: 20,
              }}
            >
              <img
                src={leftHandImg}
                referrerPolicy="no-referrer"
                alt="Left Hand"
                className={`w-full h-auto select-none pointer-events-auto bg-transparent mix-blend-multiply ${
                  debug ? "outline-2 outline-dashed outline-purple-500" : ""
                }`}
                style={{
                  transform: combinedLeftHandTransform,
                }}
              />
            </div>

            {/* 3. RIGHT HAND (z-index 30, waves on hover) */}
            <div
              id="layer-right-hand"
              className={`absolute pointer-events-auto cursor-pointer ${isHovered ? "animate-ymym-wave" : ""}`}
              style={{
                ...DEFAULT_RIG.rightHandStyle,
                transformOrigin: "bottom left",
                zIndex: 30,
              }}
            >
              <img
                src={rightHandImg}
                referrerPolicy="no-referrer"
                alt="Right Hand"
                className={`w-full h-auto select-none pointer-events-auto bg-transparent mix-blend-multiply ${
                  debug ? "outline-2 outline-dashed outline-indigo-500" : ""
                }`}
                style={{
                  transform: combinedRightHandTransform,
                }}
              />
            </div>

            {/* 4. BODY (z-index 40) */}
            <div
              id="layer-body"
              className="absolute -translate-x-1/2 pointer-events-auto cursor-pointer"
              style={{
                ...DEFAULT_RIG.bodyStyle,
                zIndex: 40,
              }}
            >
              <img
                src={bodyImg}
                referrerPolicy="no-referrer"
                alt="Body"
                className={`w-full h-auto select-none pointer-events-auto bg-transparent mix-blend-multiply ${
                  debug ? "outline-2 outline-dashed outline-blue-500" : ""
                }`}
                style={{
                  transform: combinedBodyTransform,
                }}
              />
            </div>

            {/* 5. HEAD & EYES (z-index 50/60) */}
            <div
              id="layer-head-group"
              className="absolute -translate-x-1/2 animate-ymym-head pointer-events-auto cursor-pointer"
              style={{
                ...DEFAULT_RIG.headStyle,
                transformOrigin: "bottom center",
                zIndex: 50,
              }}
            >
              <div className="relative w-full h-full pointer-events-auto">
                {/* Head frame + smile */}
                <img
                  src={headImg}
                  referrerPolicy="no-referrer"
                  alt="Head"
                  className={`w-full h-auto select-none pointer-events-auto bg-transparent mix-blend-multiply ${
                    debug ? "outline-2 outline-dashed outline-green-500" : ""
                  }`}
                  style={{
                    transform: combinedHeadTransform,
                  }}
                />

                {/* 6. EYES (z-index 60, blink swapping) */}
                <div
                  id="layer-eyes"
                  className="absolute -translate-x-1/2 pointer-events-auto"
                  style={{
                    ...DEFAULT_RIG.eyesStyle,
                    zIndex: 60,
                  }}
                >
                  {eyesOpen ? (
                    <img
                      src={openEyesImg}
                      referrerPolicy="no-referrer"
                      alt="Eyes Open"
                      className={`w-full h-auto select-none pointer-events-auto bg-transparent mix-blend-multiply ${
                        debug ? "outline-2 outline-dashed outline-red-500" : ""
                      }`}
                      style={{
                        transform: combinedOpenEyesTransform,
                      }}
                    />
                  ) : (
                    <img
                      src={closeEyesImg}
                      referrerPolicy="no-referrer"
                      alt="Eyes Closed"
                      className={`w-full h-auto select-none pointer-events-auto bg-transparent mix-blend-multiply ${
                        debug
                          ? "outline-2 outline-dashed outline-orange-500"
                          : ""
                      }`}
                      style={{
                        transform: combinedCloseEyesTransform,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Overlay Tooltip Panel */}
        {debug && (
          <div
            id="ymym-debug-panel"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-slate-900/95 text-green-400 font-mono text-[10px] p-3 rounded-lg border border-green-500/50 shadow-2xl w-60 pointer-events-auto select-text leading-tight z-[999]"
          >
            <div className="border-b border-green-500/30 pb-1 mb-2 font-bold text-center text-xs uppercase tracking-wider text-green-300">
              Ymym Rig Debugger
            </div>

            <div className="space-y-1.5 h-48 overflow-y-auto">
              <div>
                <span className="text-white font-bold">GLOBAL:</span> pos:{" "}
                {position}, size: {size}, scale: {scale}
              </div>

              <div>
                <span className="text-white font-bold">BODY:</span> size:{" "}
                {bodySize}, rotate: {bodyRotate}°, x: {bodyPosition.x}, y:{" "}
                {bodyPosition.y}
              </div>

              <div>
                <span className="text-white font-bold">HEAD:</span> size:{" "}
                {headSize}, rotate: {headRotate}°, x: {headPosition.x}, y:{" "}
                {headPosition.y}
              </div>

              <div>
                <span className="text-white font-bold">HAT:</span> size:{" "}
                {chefHatSize}, rotate: {chefHatRotate}°, x: {chefHatPosition.x},
                y: {chefHatPosition.y}
              </div>

              <div>
                <span className="text-white font-bold">LEFT HAND:</span> size:{" "}
                {leftHandSize}, rotate: {leftHandRotate}°, x:{" "}
                {leftHandPosition.x}, y: {leftHandPosition.y}
              </div>

              <div>
                <span className="text-white font-bold">RIGHT HAND:</span> size:{" "}
                {rightHandSize}, rotate: {rightHandRotate}°, x:{" "}
                {rightHandPosition.x}, y: {rightHandPosition.y}
              </div>

              <div>
                <span className="text-white font-bold">OPEN EYES:</span> size:{" "}
                {openEyesSize}, rotate: {openEyesRotate}°, x:{" "}
                {openEyesPosition.x}, y: {openEyesPosition.y}
              </div>

              <div>
                <span className="text-white font-bold">CLOSED EYES:</span> size:{" "}
                {closeEyesSize}, rotate: {closeEyesRotate}°, x:{" "}
                {closeEyesPosition.x}, y: {closeEyesPosition.y}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
