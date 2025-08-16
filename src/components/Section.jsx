import React, { useState, useEffect } from "react";
import QuizCard from "./QuizCard";

function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestionsAndOptions(questions) {
  const shuffled = shuffleArray(questions).map((q) => {
    // First, get the correct answer text using the original answer letter
    const originalAnswerIndex = q.answer.charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
    const correctAnswerText = q.options[originalAnswerIndex];
    
    // Shuffle the options
    const shuffledOptions = shuffleArray(q.options);
    
    // Find the new position of the correct answer in the shuffled array
    const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);
    const newAnswerLetter = String.fromCharCode(65 + newAnswerIndex);
    
    return {
      ...q,
      options: shuffledOptions,
      answer: newAnswerLetter, // Update answer to new position
      correctAnswerText: correctAnswerText, // Store for reference
    };
  });
  return shuffled.map((q, idx) => ({ ...q, shuffledNumber: idx + 1 }));
}

function Section({ section, questions }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [resetFlag, setResetFlag] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  // Load or create shuffle and answers for this section
  useEffect(() => {
    const shuffleKey = `kcna-shuffle-${section}`;
    const answersKey = `kcna-answers-${section}`;
    let shuffled = [];
    let answers = {};
    const savedShuffle = localStorage.getItem(shuffleKey);
    const savedAnswers = localStorage.getItem(answersKey);
    if (savedShuffle) {
      try {
        shuffled = JSON.parse(savedShuffle);
      } catch {
        shuffled = shuffleQuestionsAndOptions(questions);
        localStorage.setItem(shuffleKey, JSON.stringify(shuffled));
      }
    } else {
      shuffled = shuffleQuestionsAndOptions(questions);
      localStorage.setItem(shuffleKey, JSON.stringify(shuffled));
    }
    if (savedAnswers) {
      try {
        answers = JSON.parse(savedAnswers);
      } catch {
        answers = {};
      }
    }
    setShuffledQuestions(shuffled);
    setSelectedAnswers(answers);
  }, [section, resetFlag, questions]);

  // On restart, reshuffle and save, and clear answers
  const handleRestart = () => {
    // Remove all previous answers for this section (regardless of number)
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`kcna-${section}-`)) localStorage.removeItem(key);
    });
    // Reshuffle and persist
    const shuffled = shuffleQuestionsAndOptions(questions);
    setShuffledQuestions(shuffled);
    localStorage.setItem(`kcna-shuffle-${section}`, JSON.stringify(shuffled));
    localStorage.removeItem(`kcna-answers-${section}`);
    setResetFlag((f) => f + 1);
    setSelectedAnswers({});
  };

  const attempted = shuffledQuestions.map((q) => !!selectedAnswers[q.shuffledNumber]);
  const correct = shuffledQuestions.map(
    (q) => selectedAnswers[q.shuffledNumber] === q.answer
  );
  const attemptedCount = attempted.filter(Boolean).length;
  const correctCount = correct.filter(Boolean).length;
  const total = shuffledQuestions.length;
  const progress = total ? (attemptedCount / total) * 100 : 0;
  const percentCorrect = total ? Math.round((correctCount / total) * 100) : 0;

  // Called by QuizCard when a question is answered
  const handleAnswered = (shuffledNumber, answer) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev, [shuffledNumber]: answer };
      // Persist to localStorage
      localStorage.setItem(`kcna-answers-${section}`, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div style={{ marginBottom: "40px" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          paddingBottom: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{section}</h2>
        <button onClick={handleRestart} style={{ marginBottom: 10 }}>
          Restart Section
        </button>
        <div style={{ marginBottom: 8, fontWeight: "bold" }}>
          Success: {percentCorrect}%
        </div>
        {/* Progress Bar */}
        <div
          style={{
            margin: "10px 0",
            height: "20px",
            background: "#eee",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#4caf50",
              transition: "width 0.3s",
            }}
          />
        </div>
        {/* Question Number List - wraps */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "16px",
            paddingBottom: 4,
            maxWidth: "100vw",
          }}
        >
          {shuffledQuestions.map((q, idx) => (
            <div
              key={q.shuffledNumber}
              style={{
                minWidth: 28,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: attempted[idx] ? "#4caf50" : "#ccc",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                border:
                  attempted[idx] && attempted[idx] !== "NaN"
                    ? "2px solid #388e3c"
                    : "2px solid #bbb",
                flex: "0 0 auto",
              }}
              title={attempted[idx] ? "Attempted" : "Not attempted"}
            >
              {q.shuffledNumber}
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
        {shuffledQuestions.map((q, index) => (
          <QuizCard
            key={q.shuffledNumber}
            section={section}
            question={{ ...q, number: q.shuffledNumber }}
            selected={selectedAnswers[q.shuffledNumber] || ""}
            resetFlag={resetFlag}
            onAnswered={handleAnswered}
          />
        ))}
      </div>
    </div>
  );
}

export default Section;
