"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const Bubble = ({ size, duration, delay, initialX, initialY, color }) => {
  return (
    <motion.div
      className={`absolute rounded-full backdrop-blur-sm ${color}`}
      style={{
        width: size,
        height: size,
        left: `${initialX}%`,
        bottom: `${initialY}%`,
        boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        y: -1000,
        opacity: [0, 0.7, 0.3, 0],
        scale: [0.5, 1.2, 1, 0.8],
        x: [0, initialX > 50 ? 50 : -50, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

const BubbleBackground = () => {
  const [bubbles, setBubbles] = useState([]);
  const idCounter = useRef(0); // 👈 Create a counter that doesn't reset on re-render

  const bubbleColors = [
    "bg-white/25",
    "bg-[#FBBC05]/30",
    "bg-cyan-300/30",
    "bg-teal-200/30",
  ];

  useEffect(() => {
    const createBubble = () => ({
      id: idCounter.current++, // 👈 Always unique, increasing ID
      size: Math.floor(30 + Math.random() * 80),
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 2,
      initialX: Math.random() * 100,
      initialY: Math.random() * 30,
      color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
    });

    const createInitialBubbles = () => {
      const initialBubbles = Array.from({ length: 12 }, () => createBubble());
      setBubbles(initialBubbles);
    };

    createInitialBubbles();

    const interval = setInterval(() => {
      setBubbles((prev) => {
        const newBubblesCount = Math.floor(Math.random() * 3) + 1;
        const newBubbles = Array.from({ length: newBubblesCount }, () =>
          createBubble()
        );
        return [...prev, ...newBubbles].slice(-25);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          size={bubble.size}
          duration={bubble.duration}
          delay={bubble.delay}
          initialX={bubble.initialX}
          initialY={bubble.initialY}
          color={bubble.color}
        />
      ))}
    </div>
  );
};

export default BubbleBackground;
