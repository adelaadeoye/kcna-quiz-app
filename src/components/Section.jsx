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
  const [currentPage, setCurrentPage] = useState(0);

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

  // Pagination for question numbers
  const questionsPerPage = 10;
  const totalPages = Math.ceil(shuffledQuestions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = shuffledQuestions.slice(startIndex, endIndex);
  const currentAttempted = attempted.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  // Called by QuizCard when a question is answered
  const handleAnswered = (shuffledNumber, answer) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev, [shuffledNumber]: answer };
      // Persist to localStorage
      localStorage.setItem(`kcna-answers-${section}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Handle clicking on question number to jump to that question
  const handleQuestionClick = (questionNumber) => {
    const questionElement = document.getElementById(`question-${questionNumber}`);
    if (questionElement) {
      questionElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
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
        {/* Question Number List - paginated for mobile */}
        <div style={{ marginBottom: "16px" }}>
          {/* Pagination controls */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "8px",
            fontSize: "12px",
            color: "#666"
          }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                background: currentPage === 0 ? "#ddd" : "#007bff",
                color: currentPage === 0 ? "#999" : "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === 0 ? "not-allowed" : "pointer"
              }}
            >
              ← Prev
            </button>
            <span>
              {startIndex + 1}-{Math.min(endIndex, total)} of {total}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                background: currentPage === totalPages - 1 ? "#ddd" : "#007bff",
                color: currentPage === totalPages - 1 ? "#999" : "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer"
              }}
            >
              Next →
            </button>
          </div>
          
          {/* Question numbers */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              paddingBottom: 4,
              maxWidth: "100vw",
            }}
          >
            {currentQuestions.map((q, idx) => (
              <div
                key={q.shuffledNumber}
                onClick={() => handleQuestionClick(q.shuffledNumber)}
                style={{
                  minWidth: 28,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: currentAttempted[idx] ? "#4caf50" : "#ccc",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  border:
                    currentAttempted[idx] && currentAttempted[idx] !== "NaN"
                      ? "2px solid #388e3c"
                      : "2px solid #bbb",
                  flex: "0 0 auto",
                  cursor: "pointer",
                  transition: "transform 0.1s",
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                title={`Click to jump to question ${q.shuffledNumber} - ${currentAttempted[idx] ? "Attempted" : "Not attempted"}`}
              >
                {q.shuffledNumber}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
        {shuffledQuestions.map((q, index) => (
          <div key={q.shuffledNumber} id={`question-${q.shuffledNumber}`}>
            <QuizCard
              section={section}
              question={{ ...q, number: q.shuffledNumber }}
              selected={selectedAnswers[q.shuffledNumber] || ""}
              resetFlag={resetFlag}
              onAnswered={handleAnswered}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Section;
