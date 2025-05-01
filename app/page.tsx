"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import BubbleBackground from "@/components/BubbleBackground";
import ModeCard from "@/components/ModeCard";
import { useRouter } from "next/navigation";
import { useMode } from "@/components/ModeContext";

export default function Home() {
  const router = useRouter();
  const { mode, setMode } = useMode();
  const [selectedMode, setSelectedMode] = useState(null);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  return (
    <main className="flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-white mb-6">
          Welcome to GesturBee
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Experience the buzz of motion-controlled gaming! Use hand gestures to
          interact with the virtual bee world and compete with friends.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-4xl mx-auto">
        <ModeCard
          title="Offline Mode"
          description="Test the model locally by practicing gestures and tracking prediction accuracy"
          icon="/assets/images/offline.png"
          isSelected={selectedMode === "offline"}
          onClick={() => handleModeSelect("offline")}
        />
        <ModeCard
          title="Online Mode"
          description="Evaluate the model's performance after separating it from the training pipeline and deploying it on a server"
          icon="/assets/images/online.png"
          isSelected={selectedMode === "online"}
          onClick={() => handleModeSelect("online")}
        />
      </div>

      {/* Start Button */}
      <AnimatePresence>
        {selectedMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12"
          >
            <button
              className="px-12 py-4 bg-[#FBBC05] text-[#104846] text-xl font-bold rounded-full hover:bg-[#F9A602] transition-colors shadow-lg"
              onClick={() => {
                if (selectedMode === "offline") {
                  setMode("offline");
                  router.push("/online/practice");
                } else if (selectedMode === "online") {
                  setMode("online");
                  router.push("/online/practice");
                }
              }}
            >
              Start {selectedMode === "offline" ? "Offline" : "Online"} Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
