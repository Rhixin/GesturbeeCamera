"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMode } from "./ModeContext";

const Navigation = () => {
  const { mode, setMode } = useMode();
  const pathname = usePathname();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("Practice Mode");
  const [hoveredItem, setHoveredItem] = useState(null);

  // Set default to Practice Mode and determine online/offline mode
  useEffect(() => {
    // If path is root or doesn't match any nav items, consider Practice Mode as default
    if (
      pathname === "/" ||
      (!pathname.includes("/practice") && !pathname.includes("/gaming"))
    ) {
      setActiveItem("Practice Mode");
    } else {
      // Otherwise set based on current path
      const current = navItems.find((item) =>
        pathname.includes(item.path.split("/").pop())
      );
      if (current) setActiveItem(current.name);
    }

    // Determine if we're in online or offline mode
    if (pathname.includes("/offline")) {
      setMode("offline");
    } else {
      setMode("online");
    }
  }, [pathname]);

  const navItems = [
    {
      name: "Practice Mode",
      path: `/online/practice`,
      icon: "🎯",
      color: "#FBBC05",
      hoverColor: "#F9A602",
    },
    {
      name: "Gaming Mode",
      path: `/online/gaming`,
      icon: "🎮",
      color: "#00BFAF",
      hoverColor: "#00A199",
    },
  ];

  // Handle mode toggle
  const handleModeToggle = (newMode) => {
    setMode(newMode);
  };

  // Particle effects for active button
  const generateParticles = () => {
    return Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5 rounded-full bg-white"
        initial={{
          opacity: 0.7,
          x: 0,
          y: 0,
        }}
        animate={{
          opacity: 0,
          x: (Math.random() - 0.5) * 60,
          y: (Math.random() - 0.5) * 60,
          scale: Math.random() * 0.5 + 0.5,
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: Math.random() * 0.2,
        }}
      />
    ));
  };

  return (
    <nav className="relative flex justify-between items-center px-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 flex justify-start">
        <div
          className={`absolute top-1/2 left-0 -translate-y-1/2 w-100 h-16 rounded-full blur-xl opacity-30`}
          style={{
            background: activeItem === "Practice Mode" ? "#FBBC05" : "#00BFAF",
          }}
        />
      </div>

      {/* Main navigation bar */}
      <div className="flex items-center justify-center gap-3 relative z-10">
        {navItems.map((item) => {
          const isActive = activeItem === item.name;

          return (
            <div key={item.name} className="relative">
              <Link href={item.path}>
                <motion.div
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    isActive ? "text-[#104846]" : "text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => setActiveItem(item.name)}
                >
                  {/* Active/inactive state backgrounds */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl -z-10"
                      layoutId="activeNav"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}, ${item.hoverColor})`,
                      }}
                      transition={{
                        type: "spring",
                        bounce: 0.3,
                        duration: 0.6,
                      }}
                    >
                      {/* Inner particles animation */}
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
                        <AnimatePresence mode="popLayout">
                          {generateParticles()}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* Hover state */}
                  {!isActive && hoveredItem === item.name && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.15 }}
                      className="absolute inset-0 rounded-xl -z-10"
                      style={{ background: item.color }}
                    />
                  )}

                  {/* Icon with subtle float animation */}
                  <motion.span
                    className="text-xl"
                    animate={{ y: [0, -3, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                  >
                    {item.icon}
                  </motion.span>

                  {/* Text with gradient effect when active */}
                  <span className={isActive ? "font-bold" : ""}>
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Online/Offline Toggle - Added to the right side */}
      <div className="relative z-10">
        <div className="relative bg-gray-800 bg-opacity-50 flex items-center p-1 rounded-full w-40">
          {/* Online Option */}
          <button
            onClick={() => handleModeToggle("online")}
            className={`flex-1 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-all duration-300 ${
              mode === "online"
                ? "text-[#104846]"
                : "text-white hover:text-gray-300"
            }`}
          >
            Online
          </button>

          {/* Offline Option */}
          <button
            onClick={() => handleModeToggle("offline")}
            className={`flex-1 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-all duration-300 ${
              mode === "offline"
                ? "text-[#104846]"
                : "text-white hover:text-gray-300"
            }`}
          >
            Offline
          </button>

          {/* Animated Selection Background */}
          <motion.div
            className="absolute top-1 h-8 rounded-full"
            initial={false}
            animate={{
              x: mode === "online" ? 0 : "90%",
              width: "50%",
            }}
            transition={{
              type: "spring",
              bounce: 0.3,
              duration: 0.6,
            }}
            style={{
              background:
                activeItem === "Practice Mode"
                  ? `linear-gradient(135deg, #FBBC05, #F9A602)`
                  : `linear-gradient(135deg, #00BFAF, #00A199)`,
            }}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
