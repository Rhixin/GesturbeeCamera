"use client";
import HandTracker from "@/components/HandTracker";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import FallingLettersGame from "@/components/FallingLetters";

export default function Multiplayer() {
  const [handData, setHandData] = useState<number[] | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [socketStatus, setSocketStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const socketRef = useRef<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const socket = io("https://aslmodelbackend.onrender.com/");
    socketRef.current = socket;

    setSocketStatus("connecting");

    // Socket event handlers
    socket.on("connect", () => {
      console.log("Socket connected");
      setSocketStatus("connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketStatus("disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setSocketStatus("error");
    });

    socket.on("prediction_result", (result) => {
      setPrediction(result);
    });

    socket.on("prediction_error", (error) => {
      console.error("Prediction error:", error);
    });

    // Clean up on component unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      handData &&
      socketRef.current &&
      socketRef.current.connected &&
      hasStarted
    ) {
      socketRef.current.emit("hand_data", handData);
    }
  }, [handData]);

  return (
    <>
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {socketStatus === "connecting" ? (
            <div className="flex items-center justify-center bg-gray-100 bg-opacity-30 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-[#FBBC05] rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-[#FBBC05]">Connecting</span>
            </div>
          ) : socketStatus === "connected" ? (
            <div className="flex items-center justify-center bg-gray-100 bg-opacity-30 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-[#00BFAF] rounded-full mr-2"></div>
              <span className="text-xs text-[#00BFAF]">Connected</span>
            </div>
          ) : socketStatus === "error" ? (
            <div className="flex items-center justify-center bg-gray-100 bg-opacity-30 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              <span className="text-xs text-red-400">Error</span>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gray-100 bg-opacity-30 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-[#6B7280] rounded-full mr-2"></div>
              <span className="text-xs text-[#6B7280]">Disconnected</span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-8">
        {/* Gaming Component */}
        <FallingLettersGame
          predictedLetter={prediction ? prediction.prediction : ""}
          gameActive={hasStarted}
          setGameActive={setHasStarted}
        />

        {/* Camera and Hand Tracking */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#00BFAF]">
          <h2 className="text-xl font-semibold mb-4 text-[#104846]">
            Hand Tracking
          </h2>
          <HandTracker handData={handData} setHandData={setHandData} />
        </div>
      </div>
    </>
  );
}
