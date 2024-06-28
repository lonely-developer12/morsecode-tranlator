import React from "react";
import "./App.css";
import MorseTranslator_from_morse from "./components/MorseTranslator_from_morse";

function App() {
  return (
    <main className="App bg-gray-500">
      <header className="App-header">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          Morse Code Translator
        </h1>
      </header>
      <main className="p-4 max-w-full sm:max-w-2xl mx-auto">
        <MorseTranslator_from_morse />
      </main>
      <footer
        style={{
          backgroundColor: "#333",
          color: "#fff",
          padding: "20px 0",
          textAlign: "center",
          position: "fixed",
          left: "0",
          bottom: "0",
          width: "100%",
        }}
      >
        <div>
          <h3>all rights reserved by</h3>
        </div>
      </footer>
    </main>
  );
}

export default App;
