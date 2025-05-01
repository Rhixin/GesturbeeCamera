"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ModeCard = ({ title, description, icon, isSelected, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`flex-1 bg-white/10 backdrop-blur-sm p-8 rounded-2xl cursor-pointer transition-colors ${
        isSelected ? "ring-4 ring-[#FBBC05] bg-white/20" : ""
      }`}
      onClick={onClick}
    >
      <div className="text-5xl flex items-center justify-center">
        <img src={icon} alt="icon" className="w-40 h-40" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/80">{description}</p>
    </motion.div>
  );
};

export default ModeCard;
