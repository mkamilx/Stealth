import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [humanMode, setHumanMode] = useState(false);
  const [nlpMode, setNlpMode] = useState(false);
  const [aiAssist, setAiAssist] = useState(false);
  const [customOriginalWord, setCustomOriginalWord] = useState('');
  const [customStealthWord, setCustomStealthWord] = useState('');
  const [customReplacements, setCustomReplacements] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [acceptedSuggestions, setAcceptedSuggestions] = useState({});
  const [stealthMode, setStealthMode] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [learningMode, setLearningMode] = useState(false);
  const [dictionaryNotification, setDictionaryNotification] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState('');
  const [geminiPrompt, setGeminiPrompt] = useState(
    "Detect sensitive or political words and suggest safe, stealthy versions to bypass censorship on social media. Return a dictionary of replacements."
  );

  // Configuration for NLP
  const codewords = ['resistance', 'liberation', 'freedom'];
  const symbolSubstitutions = {
    'i': '1',
    'e': '3',
    'a': '@',
    's': '$'
  };
  const abbreviations = {
    'lol': 'laughing out loud',
    'idk': 'I don\'t know',
    'imo': 'in my opinion'
  };

  const replacements = {
    "Israel": "I$R",
    "Palestine": "P+stn",
    "Gaza": "GZ",
    "Zionist": "Z!on!st",
    "genocide": "g*nocide",
    "Occupation": "0ccup@t!0n"
  };

  const humanModeReplacements = {
    "Israel": "The Oppressor",
    "Palestine": "The Oppressed",
    "Gaza": "The Open-Air Prison",
    "Zionist": "Believer of Oppression",
    "genocide": "The Unspeakable Act",
    "Occupation": "The Silent Thief"
  };

  const convertText = () => {
    let text = inputText;
    const currentReplacements = humanMode ? humanModeReplacements : replacements;

    // Apply built-in replacements
    Object.keys(currentReplacements).forEach(word => {
      const replacement = currentReplacements[word];
      const regex = new RegExp(word, 'gi');
      text = text.replace(regex, replacement);
    });

    // Apply custom replacements
    Object.keys(customReplacements).forEach(word => {
      const replacement = customReplacements[word];
      const regex = new RegExp(word, 'gi');
      text = text.replace(regex, replacement);
    });

    // Apply AI-suggested replacements
    Object.keys(acceptedSuggestions).forEach(word => {
      const replacement = acceptedSuggestions[word];
      const regex = new RegExp(word, 'gi');
      text = text.replace(regex, replacement);
    });

    if (nlpMode) {
      text = applyNLP(text);
    }

    setOutputText(text);
  };

  const applyNLP = (text) => {
    // 1. Codeword Insertion
    const codeword = codewords[Math.floor(Math.random() * codewords.length)];
    text = `${codeword} ${text} ${codeword}`;

    // 2. Symbol Substitution
    Object.keys(symbolSubstitutions).forEach(char => {
      const regex = new RegExp(char, 'gi');
      text = text.replace(regex, symbolSubstitutions[char]);
    });

    // 3. Abbreviation Expansion
    Object.keys(abbreviations).forEach(abbr => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      text = text.replace(regex, abbreviations[abbr]);
    });

    // Metaphor and Analogies (basic example)
    if (text.includes("oppression")) {
      text = text.replace("oppression", "a heavy yoke");
    }

    // Placeholder for sentiment analysis and confidence score
    const sentimentScore = 0.8; // Dummy value
    const confidenceScore = 0.7; // Dummy value

    console.log("Sentiment Score:", sentimentScore);
    console.log("Confidence Score:", confidenceScore);

    return text;
  };

  const copyText = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        navigator.clipboard.writeText(outputText);
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          console.error("Failed to copy text: ", err);
          alert("Failed to copy text to clipboard. Please check your browser permissions or try again later.");
        } else {
          console.error("An unexpected error occurred: ", err);
          alert("An unexpected error occurred while copying text.");
        }
      }
    } else {
      alert("Clipboard API is not supported in this browser. Please copy the text manually.");
    }
  };

  const resetText = () => {
    setInputText('');
    setOutputText('');
  };

  const addCustomReplacement = () => {
    if (customOriginalWord && customStealthWord) {
      setCustomReplacements(prev => ({
        ...prev,
        [customOriginalWord]: customStealthWord
      }));
      setCustomOriginalWord('');
      setCustomStealthWord('');
      setDictionaryNotification('✔️ New word added to dictionary!');
      setTimeout(() => setDictionaryNotification(''), 3000);
    }
  };

  const suggestStealthWords = async (text) => {
    if (!aiAssist) return;

    setGeminiLoading(true);
    setGeminiError('');

    try {
      const response = await fetchGeminiSuggestions(text, geminiPrompt);
      setAiSuggestions(response);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setGeminiError('AI couldn’t process your request. Please try again.');
    } finally {
      setGeminiLoading(false);
    }
  };

  const fetchGeminiSuggestions = async (text, prompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Gemini API key is missing. Please set the GEMINI_API_KEY environment variable.");
      throw new Error("Gemini API key is missing.");
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{ text: `${prompt}\n${text}` }]
      }]
    };

    const response = await fetch(geminiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Gemini API Error:", response.status, response.statusText);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      console.warn("Gemini API returned no suggestions.");
      return {};
    }

    const content = data.candidates[0].content.parts[0].text;

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse Gemini response:", content, error);
      return {};
    }
  };

  const acceptSuggestion = (word) => {
    setAcceptedSuggestions(prev => ({
      ...prev,
      [word]: aiSuggestions[word]
    }));

    setCustomReplacements(prev => ({
      ...prev,
      [word]: aiSuggestions[word]
    }));

    // Remove accepted suggestion from AI suggestions
    const newSuggestions = { ...aiSuggestions };
    delete newSuggestions[word];
    setAiSuggestions(newSuggestions);

    setDictionaryNotification('✔️ New word added to dictionary!');
    setTimeout(() => setDictionaryNotification(''), 3000);
  };

  const rejectSuggestion = (word) => {
    const newSuggestions = { ...aiSuggestions };
    delete newSuggestions[word];
    setAiSuggestions(newSuggestions);
  };

  const exportDictionary = () => {
    const dictionary = {
      customReplacements: customReplacements,
      acceptedSuggestions: acceptedSuggestions
    };
    const json = JSON.stringify(dictionary);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stealth_dictionary.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importDictionary = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = JSON.parse(e.target.result);
      setCustomReplacements(json.customReplacements || {});
      setAcceptedSuggestions(json.acceptedSuggestions || {});
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    convertText(); // Initial conversion on load
  }, [humanMode, nlpMode, inputText, customReplacements, acceptedSuggestions, stealthMode]); // React to changes in modes and input text

  useEffect(() => {
    if (aiAssist) {
      suggestStealthWords(inputText);
    } else {
      setAiSuggestions({});
    }
  }, [aiAssist, inputText, geminiPrompt]);

  const filteredCustomReplacements = Object.entries(customReplacements)
    .filter(([originalWord, stealthVersion]) =>
      originalWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stealthVersion.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Header Section */}
      <header className="app-header">
        <div className="header-left">
          <span>🏠</span> {/* Home Icon */}
        </div>
        <h1>🛡️ StealthText AI</h1>
        <div className="header-right">
          <span onClick={() => setDarkMode(!darkMode)}>⚙️</span> {/* Settings Icon */}
        </div>
      </header>

      {/* Input and Conversion Area */}
      <section className="input-conversion-area">
        <div className="input-area">
          <textarea
            placeholder="✍️ Write or paste sensitive text here…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button onClick={() => suggestStealthWords(inputText)} disabled={geminiLoading}>
            {geminiLoading ? 'Thinking...' : 'Detect Sensitive Words'}
          </button>
          {geminiError && <div className="error-message">{geminiError}</div>}
        </div>

        {/* AI Suggestions Box */}
        {aiAssist && Object.keys(aiSuggestions).length > 0 && (
          <div className="ai-suggestions-box">
            <h3>AI Suggestions</h3>
            <ul>
              {Object.keys(aiSuggestions).map(word => (
                <li key={word}>
                  {word} → {aiSuggestions[word]}
                  <button onClick={() => acceptSuggestion(word)}>✔️ Accept</button>
                  <button onClick={() => rejectSuggestion(word)}>❌ Ignore</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="stealth-mode-toggle">
          <label>
            Stealth Mode:
            <input
              type="checkbox"
              checked={stealthMode}
              onChange={(e) => setStealthMode(e.target.checked)}
            />
          </label>
        </div>

        <button onClick={convertText}>Convert with AI</button>

        <div className="output-area">
          <textarea
            placeholder="🔐 Converted text will appear here…"
            value={outputText}
            readOnly
          />
        </div>
      </section>

      {/* Stealth Dictionary Area */}
      <section className="stealth-dictionary-area">
        <h2>Manage Custom Words</h2>
        <input
          type="text"
          placeholder="Search custom words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul className="custom-word-list">
          {filteredCustomReplacements.map(([originalWord, stealthVersion]) => (
            <li key={originalWord}>
              {originalWord} → {stealthVersion}
              <button>🗑️ Delete</button>
              <button>✏️ Edit</button>
            </li>
          ))}
        </ul>

        <div className="add-custom-word-form">
          <h3>Add Custom Word</h3>
          <input
            type="text"
            placeholder="Enter Sensitive Word"
            value={customOriginalWord}
            onChange={(e) => setCustomOriginalWord(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Stealth Version"
            value={customStealthWord}
            onChange={(e) => setCustomStealthWord(e.target.value)}
          />
          <button onClick={addCustomReplacement}>➕ Add Word</button>
        </div>
      </section>

      {dictionaryNotification && (
        <div className="dictionary-notification">{dictionaryNotification}</div>
      )}

      {/* AI Assist Toggle */}
      <div className="ai-assist-toggle">
        <label>
          AI Assist:
          <input
            type="checkbox"
            checked={aiAssist}
            onChange={(e) => setAiAssist(e.target.checked)}
          />
        </label>
      </div>

      {/* Learning Mode Toggle */}
      <div className="learning-mode-toggle">
        <label>
          Allow AI to Learn:
          <input
            type="checkbox"
            checked={learningMode}
            onChange={(e) => setLearningMode(e.target.checked)}
          />
        </label>
        <p>AI will learn from your custom word choices to improve future suggestions.</p>
      </div>

      {/* Gemini Prompt Input */}
      {/*
      <div>
        <label>
          Gemini Prompt:
          <input
            type="text"
            value={geminiPrompt}
            onChange={(e) => setGeminiPrompt(e.target.value)}
          />
        </label>
      </div>
      */}

      {/* Footer Section */}
      <footer className="app-footer">
        <a href="#about">About</a>
        <a href="#terms">Terms of Use</a>
        <a href="#contact">Contact</a>
      </footer>
    </div>
  );
}

export default App;
