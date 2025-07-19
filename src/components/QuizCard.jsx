import React from "react";

function QuizCard({ section, question, selected, resetFlag, onAnswered }) {
  const handleChange = (e) => {
    if (!selected) {
      if (onAnswered) onAnswered(question.number, e.target.value);
    }
  };

  const isCorrect = selected === question.answer;
  const showExplanation = !!selected;

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px", borderRadius: "5px" }}>
      <p><strong>Q{question.number}:</strong> {question.question}</p>
      {question.options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        return (
          <div key={idx}>
            <label>
              <input
                type="radio"
                name={`q-${section}-${question.number}`}
                value={letter}
                checked={selected === letter}
                onChange={handleChange}
                disabled={!!selected}
              />
              {` ${letter}. ${opt}`}
            </label>
          </div>
        );
      })}
      {showExplanation && (
        <div style={{ marginTop: "10px", color: isCorrect ? "green" : "red" }}>
          {isCorrect ? "\u2705 Correct!" : `\u274c Incorrect. Correct answer: ${question.answer}`}
          <div style={{ marginTop: "5px", fontStyle: "italic" }}>{question.explanation}</div>
        </div>
      )}
    </div>
  );
}

export default QuizCard;
