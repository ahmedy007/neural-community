
import { useState } from "react";
import "./App.css";

const questions = [
  {
    title: "Why does my machine learning model overfit?",
    description:
      "My training accuracy is high, but validation accuracy is much lower. How can I improve generalization?",
    tags: ["Machine Learning", "Python"],
    answers: 8,
    views: 243,
  },
  {
    title: "How do I accelerate PyTorch training with CUDA?",
    description:
      "Looking for practical ways to improve GPU utilization and reduce training time.",
    tags: ["PyTorch", "CUDA", "GPU"],
    answers: 5,
    views: 186,
  },
  {
    title: "Which embedding model should I use for RAG?",
    description:
      "Comparing embedding models for a retrieval-augmented generation application.",
    tags: ["LLMs", "RAG"],
    answers: 12,
    views: 421,
  },
];

const topics = ["All", "Python", "Machine Learning", "LLMs", "CUDA", "PyTorch"];

function App() {
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = `${question.title} ${question.description} ${question.tags.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesTopic =
      activeTopic === "All" || question.tags.includes(activeTopic);

    return matchesSearch && matchesTopic;
  });

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">N</span>
          neural<span>hub</span>
        </a>
        <nav>
          <a href="#questions">Questions</a>
          <a href="#topics">Topics</a>
          <a href="#about">About</a>
        </nav>
        <a className="nav-cta" href="#questions">Explore community ↗</a>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">
            <span className="status-dot" />
            THE COMMUNITY FOR AI BUILDERS
          </div>

          <h1>
            Stuck on AI?
            <br />
            <span>Let's solve it together.</span>
          </h1>

          <p className="hero-description">
            Ask questions, debug models, share solutions, and learn with
            developers building the future of artificial intelligence.
          </p>

          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search AI problems, errors, models..."
              aria-label="Search questions"
            />
            <span className="search-hint">Search</span>
          </div>

          <div className="hero-meta">
            <span>✳ Practical answers</span>
            <span>⌘ Open collaboration</span>
            <span>⟡ Built for AI learners</span>
          </div>
        </section>

        <section className="community" id="questions">
          <div className="section-heading">
            <div>
              <div className="section-kicker">KNOWLEDGE BASE</div>
              <h2>Explore discussions</h2>
              <p>Real-world AI questions and solutions, all in one place.</p>
            </div>
            <button
              className="ask-button"
              onClick={() =>
                alert("Question posting will be available in a future update.")
              }
            >
              + Ask a question
            </button>
          </div>

          <div className="topics" id="topics">
            {topics.map((topic) => (
              <button
                key={topic}
                className={activeTopic === topic ? "topic active" : "topic"}
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="question-list">
            {filteredQuestions.map((question, index) => (
              <article className="question-card" key={question.title}>
                <div className="question-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="question-content">
                  <h3>{question.title}</h3>
                  <p>{question.description}</p>
                  <div className="question-tags">
                    {question.tags.map((tag) => (
                      <button
                        className="tag"
                        key={tag}
                        onClick={() => setActiveTopic(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="question-stats">
                  <strong>{question.answers}</strong>
                  <span>answers</span>
                  <strong>{question.views}</strong>
                  <span>views</span>
                </div>
              </article>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="empty-state">
                No matching questions. Try another search or topic.
              </div>
            )}
          </div>
        </section>

        <section className="join-banner" id="about">
          <div>
            <div className="section-kicker">BUILD SOMETHING TOGETHER</div>
            <h2>Every great model starts with a question.</h2>
            <p>
              Share what you're learning. Help someone solve a problem.
              Improve the AI community, one answer at a time.
            </p>
          </div>
          <a href="#questions" className="banner-link">
            Explore questions ↗
          </a>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#">
          <span className="brand-icon">N</span>
          neural<span>hub</span>
        </a>
        <span>Built by the community, for the AI community.</span>
      </footer>
    </div>
  );
}

export default App;
