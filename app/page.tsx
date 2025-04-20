"use client";
import HandTracker from "@/components/HandTracker";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [handData, setHandData] = useState<number[] | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [socketStatus, setSocketStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const socketRef = useRef<any>(null);

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
    if (handData && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("hand_data", {
        features: handData,
      });
    }
  }, [handData]);

  return (
    <main className="w-[100vw] h-[100vh]">
      <h1 className="text-2xl">ASL AI</h1>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">Result: {JSON.stringify(prediction)}</div>
      </div>

      <HandTracker handData={handData} setHandData={setHandData} />

      <div className="mt-2 flex items-center justify-center">
        {socketStatus === "connecting" ? (
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-yellow-500">
              Connecting to server...
            </span>
          </div>
        ) : socketStatus === "connected" ? (
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-500">Connected to server</span>
          </div>
        ) : socketStatus === "error" ? (
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-red-500">Connection error</span>
          </div>
        ) : (
          <div className="flex items-center justify-center ">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-500">Disconnected</span>
          </div>
        )}
      </div>
    </main>
  );
}
