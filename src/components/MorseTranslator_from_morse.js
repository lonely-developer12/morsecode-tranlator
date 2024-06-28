import React, { useState, useRef, useCallback, useEffect } from "react";

function MorseTranslator_from_morse() {
  // State variables
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(600);
  const [isPlaying, setIsPlaying] = useState(false);
  // Refs for audio context and timeouts
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Morse code dictionary
  const morseCode = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    0: "-----",
    1: ".----",
    2: "..---",
    3: "...--",
    4: "....-",
    5: ".....",
    6: "-....",
    7: "--...",
    8: "---..",
    9: "----.",
    " ": "/",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "'": ".----.",
    "!": "-.-.--",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    _: "..--.-",
    '"': ".-..-.",
    $: "...-..-",
    "@": ".--.-.",
    "¿": "..-.-",
    "¡": "--...-",
  };
  // Reverse morse code dictionary for decoding
  const reverseMorseCode = Object.fromEntries(
    Object.entries(morseCode).map(([key, value]) => [value, key])
  );

  // Function to play a single tone
  const playTone = useCallback((pitch, volume) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;

    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(pitch, audioContext.currentTime);

    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.001);

    oscillator.start();
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
  }, []);

  // Function to stop the current tone
  const stopTone = useCallback(() => {
    if (gainNodeRef.current) {
      const now = audioContextRef.current.currentTime;
      gainNodeRef.current.gain.linearRampToValueAtTime(0, now + 0.001);
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current = null;
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
        }
      }, 10);
    }
  }, []);

  // Function to play the entire Morse code sound
  const playMorseSound = useCallback(
    (morseText) => {
      setIsPlaying(true);
      const dotDuration = 100 / speed;
      const dashDuration = 300 / speed;
      const pauseDuration = 100 / speed;

      let totalDelay = 0;

      for (let char of morseText) {
        switch (char) {
          case ".":
            timeoutsRef.current.push(
              setTimeout(() => {
                playTone(pitch, volume);
                timeoutsRef.current.push(
                  setTimeout(() => stopTone(), dotDuration)
                );
              }, totalDelay)
            );
            totalDelay += dotDuration + pauseDuration;
            break;
          case "-":
            timeoutsRef.current.push(
              setTimeout(() => {
                playTone(pitch, volume);
                timeoutsRef.current.push(
                  setTimeout(() => stopTone(), dashDuration)
                );
              }, totalDelay)
            );
            totalDelay += dashDuration + pauseDuration;
            break;
          case " ":
            totalDelay += 3 * pauseDuration;
            break;
          default:
            break;
        }
      }

      timeoutsRef.current.push(
        setTimeout(() => {
          setIsPlaying(false);
        }, totalDelay)
      );
    },
    [playTone, stopTone, pitch, volume, speed]
  );
  // Function to stop the Morse code sound
  const stopMorseSound = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    stopTone();
    setIsPlaying(false);
  }, [stopTone]);
  // Handler for translating to Morse code
  const translateToMorse = useCallback((text) => {
    return text
      .toUpperCase()
      .split("")
      .map((char) => morseCode[char] || char)
      .join(" ");
  }, []);

  // Function to translate Morse code to text
  const translateFromMorse = useCallback((morseText) => {
    return morseText
      .split(" ")
      .map((code) => reverseMorseCode[code] || code)
      .join("");
  }, []);

  // Handler for input text changes
  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
  }, []);
  // Function to translate text to Morse code
  const handleTranslateToMorse = useCallback(() => {
    if (inputText.trim() === "") {
      setShowPopup(true);
    } else {
      const morseText = translateToMorse(inputText);
      setOutputText(morseText);
    }
  }, [inputText, translateToMorse]);
  // Handler for translating from Morse code
  const handleTranslateFromMorse = useCallback(() => {
    if (inputText.trim() === "") {
      setShowPopup(true);
    } else {
      setOutputText(translateFromMorse(inputText));
    }
  }, [inputText, translateFromMorse]);
  // Function to close the warning popup
  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);
  // Cleanup effect to clear timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);
  // JSX for the component UI
  return (
    <div className="p-2 sm:p-4 max-w-full sm:max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
        Morse code translator
      </h2>
      {/* Input field */}
      <input
        className="w-full p-2 border rounded mb-2 sm:mb-4 text-sm sm:text-base"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Enter text or Morse code"
      />
      {/* Translation buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2 sm:mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded text-sm sm:text-base"
          onClick={handleTranslateToMorse}
        >
          To Morse
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded text-sm sm:text-base"
          onClick={handleTranslateFromMorse}
        >
          From Morse
        </button>
      </div>

      {/* Output display */}
      {outputText && (
        <div className="bg-gray-100 p-2 sm:p-4 rounded">
          <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base">
            Output:
          </h3>
          <p className="break-words text-sm sm:text-base">{outputText}</p>
          <button
            className={`mt-2 ${
              isPlaying
                ? "bg-red-500 hover:bg-red-700"
                : "bg-yellow-500 hover:bg-yellow-700"
            } text-white font-bold py-1 sm:py-2 px-2 sm:px-4 rounded text-sm sm:text-base w-full sm:w-auto`}
            onClick={() =>
              isPlaying ? stopMorseSound() : playMorseSound(outputText)
            }
          >
            {isPlaying ? "Stop Sound" : "Play Sound"}
          </button>
        </div>
      )}
      {/* Volume control */}
      <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center">
        <label htmlFor="volumeSlider" className="mr-2 text-sm sm:text-base">
          Volume:
        </label>
        <div className="flex items-center w-full">
          <input
            id="volumeSlider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="ml-2 text-sm sm:text-base">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Speed control */}
      <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center">
        <label htmlFor="speedSlider" className="mr-2 text-sm sm:text-base">
          Speed:
        </label>
        <div className="flex items-center w-full">
          <input
            id="speedSlider"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="ml-2 text-sm sm:text-base">{speed.toFixed(1)}x</span>
        </div>
      </div>
      {/* Pitch control */}
      <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center">
        <label htmlFor="pitchSlider" className="mr-2 text-sm sm:text-base">
          Pitch:
        </label>
        <div className="flex items-center w-full">
          <input
            id="pitchSlider"
            type="range"
            min="300"
            max="1000"
            step="10"
            value={pitch}
            onChange={(e) => setPitch(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="ml-2 text-sm sm:text-base">{pitch} Hz</span>
        </div>
      </div>
      {/* Warning popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-3 sm:p-5 border w-64 sm:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                Warning
              </h3>
              <div className="mt-2 px-4 sm:px-7 py-2 sm:py-3">
                <p className="text-xs sm:text-sm text-gray-500">
                  Please fill in the blank field.
                </p>
              </div>
              <div className="items-center px-2 sm:px-4 py-2 sm:py-3">
                <button
                  onClick={closePopup}
                  className="px-2 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white text-xs sm:text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MorseTranslator_from_morse;
