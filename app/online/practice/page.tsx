"use client";
import HandTracker from "@/components/HandTracker";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/components/ModeContext";

export default function SinglePlayer() {
  const [handData, setHandData] = useState<number[] | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [socketStatus, setSocketStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const socketRef = useRef<any>(null);
  const [showStats, setShowStats] = useState(false);

  const { mode, setMode } = useMode();

  useEffect(() => {
    console.log(mode);
    let socket;

    if (mode === "online") {
      socket = io("https://aslmodelbackend.onrender.com/");
    } else {
      socket = io("http://127.0.0.1:10000/");
    }

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
  }, [mode]);

  useEffect(() => {
    if (handData && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("hand_data", handData);
    }
  }, [handData]);

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-1 bg-[#104846] hover:bg-[#0d3b39] rounded-full text-xs text-white"
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Camera and Hand Tracking */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#00BFAF]">
          <h2 className="text-xl font-semibold mb-4 text-[#104846]">
            Hand Tracking
          </h2>
          <HandTracker handData={handData} setHandData={setHandData} />
        </div>

        {/* Prediction Result */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#00BFAF] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-[#104846]">
            Sign Language Recognition
          </h2>

          <div className="flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {prediction ? (
                <motion.div
                  key={prediction.prediction}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-[12rem] font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00BFAF] to-[#104846] leading-none">
                    {prediction.prediction}
                  </div>

                  <div className="flex items-center justify-center mb-2 w-full max-w-xs">
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FBBC05] to-[#985b10] rounded-full"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-[#6B7280] text-sm">
                    Confidence: {(prediction.confidence * 100).toFixed(2)}%
                  </div>

                  {showStats && (
                    <div className="mt-4 px-4 py-2 bg-[#104846] bg-opacity-10 rounded-lg text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-white">Processing time:</div>
                        <div className="text-right text-[#FBBC05]">
                          {prediction.processing_time.toFixed(2)} ms
                        </div>
                        <div className="text-white">Request frequency:</div>
                        <div className="text-right text-[#FBBC05]">
                          {prediction.request_frequency} req/sec
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#6B7280] text-center"
                >
                  <p>Show a hand sign to begin translation</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
