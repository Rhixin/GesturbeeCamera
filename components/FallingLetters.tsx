"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FallingLettersGame = ({
  predictedLetter,
  gameActive,
  setGameActive,
}: {
  predictedLetter: string;
  gameActive: boolean;
  setGameActive: (active: boolean) => void;
}) => {
  const [letters, setLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("normal"); // easy, normal, hard
  const [predictedLetters, setPredictedLetters] = useState([]); // Array to store unique predicted letters
  const [lastPopTime, setLastPopTime] = useState(Date.now());

  // Use refs to track state without causing re-renders
  const lettersRef = useRef([]);
  const totalGeneratedRef = useRef(0);
  const gameActiveRef = useRef(false);
  const difficultyRef = useRef("normal");
  const predictedLettersRef = useRef([]);

  // Tracking total letters generated (state version for display)
  const [totalLettersGenerated, setTotalLettersGenerated] = useState(0);

  // Configure game parameters based on difficulty
  const gameParams = {
    easy: {
      maxLetters: 3,
      spawnInterval: 1000,
      fallDuration: 40000,
      maxLettersTotal: 20,
    },
    normal: {
      maxLetters: 4,
      spawnInterval: 500, // Faster interval for testing
      fallDuration: 15000,
      maxLettersTotal: 20,
    },
    hard: {
      maxLetters: 5,
      spawnInterval: 1500,
      fallDuration: 10000,
      maxLettersTotal: 20,
    },
  };

  // Auto-pop interval in milliseconds
  const autoPoppInterval = 10000;

  // Keep refs in sync with state
  useEffect(() => {
    lettersRef.current = letters;
    gameActiveRef.current = gameActive;
    difficultyRef.current = difficulty;
    totalGeneratedRef.current = totalLettersGenerated;
    predictedLettersRef.current = predictedLetters;
  }, [
    letters,
    gameActive,
    difficulty,
    totalLettersGenerated,
    predictedLetters,
  ]);

  // Generate a random letter
  const generateRandomLetter = useCallback(() => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }, []);

  // Generate a random horizontal position
  const generateRandomPosition = useCallback(() => {
    // Return a percentage between 5% and 95% to keep letters within visible area
    return Math.floor(Math.random() * 90) + 5;
  }, []);

  // Start game
  const startGame = () => {
    setLetters([]);
    setScore(0);
    setTotalLettersGenerated(0);
    totalGeneratedRef.current = 0;
    setPredictedLetters([]);
    setLastPopTime(Date.now());
    setGameActive(true);

    console.log("Game started!");
  };

  // Process letter detection
  const handleDetectedGesture = useCallback((letter) => {
    // Check if letter exists in falling letters
    const letterIndex = lettersRef.current.findIndex(
      (item) => item.letter === letter
    );

    if (letterIndex !== -1) {
      // Remove the letter (pop it)
      setLetters((prevLetters) => {
        const newLetters = [...prevLetters];
        newLetters.splice(letterIndex, 1);
        return newLetters;
      });

      // Increase score
      setScore((prevScore) => prevScore + 1);

      return true;
    }

    return false;
  }, []);

  // Find the longest letter in the predictions array
  const findLongestLetter = useCallback(() => {
    if (predictedLettersRef.current.length === 0) return null;

    // Since all letters are single characters, just return the first one
    // This could be modified if you want a different selection criterion
    return predictedLettersRef.current[0];
  }, []);

  // Auto-pop the longest predicted letter every 5 seconds
  useEffect(() => {
    if (!gameActive || predictedLetters.length === 0) return;

    const intervalId = setInterval(() => {
      const currentTime = Date.now();

      // Check if 5 seconds have passed since last pop
      if (currentTime - lastPopTime >= autoPoppInterval) {
        const letterToRemove = findLongestLetter();

        if (letterToRemove) {
          console.log(`Auto-popping letter: ${letterToRemove}`);
          setPredictedLetters((prev) =>
            prev.filter((letter) => letter !== letterToRemove)
          );
          setLastPopTime(currentTime);
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, [gameActive, predictedLetters, lastPopTime, findLongestLetter]);

  // Process all predicted letters when letters change
  useEffect(() => {
    if (!gameActive || predictedLetters.length === 0) return;

    // Make a copy to avoid modifying the array while iterating
    const processedLetters = [];

    // Try to match each predicted letter with falling letters
    predictedLetters.forEach((letter) => {
      const success = handleDetectedGesture(letter);
      if (success) {
        processedLetters.push(letter);
      }
    });

    // Remove processed letters from the array
    if (processedLetters.length > 0) {
      setPredictedLetters((prev) =>
        prev.filter((letter) => !processedLetters.includes(letter))
      );
    }
  }, [letters, gameActive, handleDetectedGesture, predictedLetters]);

  // Watch for predicted letter changes and add to array if unique
  useEffect(() => {
    if (!gameActive || !predictedLetter) return;

    // Only add if this letter is not already in the array
    if (!predictedLetters.includes(predictedLetter) && predictedLetter != "") {
      setPredictedLetters((prev) => [...prev, predictedLetter]);
    }
  }, [predictedLetter, gameActive, predictedLetters]);

  // Generate letters with a separate approach
  useEffect(() => {
    if (!gameActive) return;

    // Function to add a new letter if conditions are met
    const addNewLetter = () => {
      // Use refs to avoid closure issues
      const currentLetters = lettersRef.current;
      const currentTotal = totalGeneratedRef.current;
      const currentDifficulty = difficultyRef.current;
      const isGameActive = gameActiveRef.current;

      if (!isGameActive) return;

      // Check if we can add more letters
      if (
        currentLetters.length < gameParams[currentDifficulty].maxLetters &&
        currentTotal < gameParams[currentDifficulty].maxLettersTotal
      ) {
        // Create a new letter
        const newLetter = {
          id: `letter-${Date.now()}-${Math.random()}`,
          letter: generateRandomLetter(),
          xPosition: generateRandomPosition(),
          createdAt: Date.now(),
        };

        // Update state
        setLetters((prev) => [...prev, newLetter]);

        // Update counter
        const newTotal = currentTotal + 1;
        totalGeneratedRef.current = newTotal;
        setTotalLettersGenerated(newTotal);
      }
    };

    // Initial letter
    addNewLetter();

    // Set up interval for continuous generation
    const intervalId = setInterval(
      addNewLetter,
      gameParams[difficulty].spawnInterval
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [
    gameActive,
    difficulty,
    generateRandomLetter,
    generateRandomPosition,
    gameParams,
  ]);

  // Remove letters that reach the bottom
  useEffect(() => {
    if (!gameActive) return;

    const checkLetterPositions = setInterval(() => {
      const currentTime = Date.now();

      setLetters((prevLetters) =>
        prevLetters.filter(
          (letter) =>
            currentTime - letter.createdAt < gameParams[difficulty].fallDuration
        )
      );

      // Check if game should end (all letters generated and none left)
      if (
        totalLettersGenerated >= gameParams[difficulty].maxLettersTotal &&
        letters.length === 0
      ) {
        setGameActive(false);
      }
    }, 500);

    return () => clearInterval(checkLetterPositions);
  }, [
    gameActive,
    letters,
    totalLettersGenerated,
    difficulty,
    gameParams,
    setGameActive,
  ]);

  // Testing buttons for simulating sign language detection
  const testButtons = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Calculate time remaining until next auto-pop
  const timeUntilNextPop = Math.max(
    0,
    autoPoppInterval - (Date.now() - lastPopTime)
  );
  const secondsRemaining = Math.ceil(timeUntilNextPop / 1000);

  return (
    <div className="relative w-full h-[600px] bg-white bg-opacity-90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-[#00BFAF] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#104846]">
          Eliminate the Letters with Sign Language
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-[#104846]">
            Score: <span className="text-[#FBBC05]">{score}</span>
          </div>
          <div className="text-sm text-[#104846]">
            Letters:{" "}
            <span className="text-[#00BFAF]">
              {totalLettersGenerated}/{gameParams[difficulty].maxLettersTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Game area */}
      <div className="relative flex-1 border-2 border-dashed border-[#00BFAF]/30 rounded-lg overflow-hidden bg-[#F8FCFC]">
        {!gameActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold text-[#104846] mb-4">
              {totalLettersGenerated > 0 ? "Game Over!" : "Ready to Play?"}
            </h3>
            <p className="mb-6 text-center max-w-md text-[#104846]/80">
              Use sign language gestures to pop the falling letters before they
              reach the bottom!
            </p>

            <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-4">
                {["easy", "normal", "hard"].map((level) => (
                  <button
                    key={level}
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                      difficulty === level
                        ? "bg-[#00BFAF] ring-2 ring-[#104846]"
                        : "bg-[#104846] hover:bg-[#1A5E5C]"
                    }`}
                    onClick={() => setDifficulty(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>

              <button
                className="px-8 py-3 bg-[#FBBC05] text-[#104846] rounded-lg font-bold hover:bg-[#F9A602] transition-colors"
                onClick={startGame}
              >
                {totalLettersGenerated > 0 ? "Play Again" : "Start Game"}
              </button>
            </div>

            {totalLettersGenerated > 0 && (
              <div className="mt-6 text-xl font-semibold text-[#104846]">
                Final Score: <span className="text-[#FBBC05]">{score}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="absolute top-4 right-4 px-3 py-2 bg-[#104846] text-white rounded-lg z-10">
              <div className="mb-1">
                Detected:{" "}
                <span className="font-bold text-[#FBBC05]">
                  {predictedLetters.join(", ")}
                </span>
              </div>

              {predictedLetters.length > 0 && (
                <div className="text-xs text-white/80">
                  Auto-pop in: {secondsRemaining}s
                </div>
              )}
            </div>

            <AnimatePresence>
              {letters.map((item) => (
                <motion.div
                  key={item.id}
                  className="absolute top-0 flex items-center justify-center w-12 h-12 text-2xl font-bold text-white bg-[#104846] rounded-full"
                  style={{ left: `${item.xPosition}%` }}
                  initial={{ y: -60 }}
                  animate={{ y: "calc(100vh - 180px)" }}
                  exit={{
                    scale: [1, 1.5, 0],
                    opacity: [1, 1, 0],
                    transition: { duration: 0.4 },
                  }}
                  transition={{
                    y: {
                      duration: gameParams[difficulty].fallDuration / 1000,
                      ease: "linear",
                    },
                  }}
                >
                  {item.letter}
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Testing toolbar - in production, this would be replaced by your actual hand tracking */}
      {gameActive && (
        <div className="mt-4 p-2 bg-[#104846]/10 rounded-lg">
          <p className="text-xs text-[#104846] mb-2">
            Testing: Click buttons below to simulate sign language detection
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {testButtons.map((letter) => (
              <button
                key={letter}
                className="w-8 h-8 flex items-center justify-center bg-[#00BFAF] text-white rounded hover:bg-[#104846] transition-colors"
                onClick={() => {
                  // Add letter to prediction array when clicked
                  if (!predictedLetters.includes(letter)) {
                    setPredictedLetters((prev) => [...prev, letter]);
                  }
                }}
              >
                {letter}
              </button>
            ))}
          </div>

          {predictedLetters.length > 0 && (
            <div className="mt-2 text-center">
              <button
                className="px-3 py-1 bg-[#104846] text-white text-sm rounded"
                onClick={() => setPredictedLetters([])}
              >
                Clear Detected Letters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FallingLettersGame;
