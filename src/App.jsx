import React, { useState } from "react";
import Section from "./components/Section";
import quizData from "./data/quiz_data.json";

function App() {
  const [selectedSection, setSelectedSection] = useState(Object.keys(quizData)[0]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>KCNA Quiz App</h1>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="section-select">Select Section: </label>
        <select
          id="section-select"
          value={selectedSection}
          onChange={e => setSelectedSection(e.target.value)}
        >
          {Object.keys(quizData).map(section => (
            <option key={section} value={section}>{section}</option>
          ))}
        </select>
      </div>
      <Section section={selectedSection} questions={quizData[selectedSection]} />
    </div>
  );
}

export default App;
