
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

type Question = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at?: string;
  answers: number;
  views: number;
};

const sampleQuestions: Question[] = [
  {
    id: "sample-1",
    title: "Why does my machine learning model overfit?",
    body: "My training accuracy is high, but validation accuracy is much lower. How can I improve generalization?",
    tags: ["Machine Learning", "Python"],
    answers: 8,
    views: 243,
  },
  {
    id: "sample-2",
    title: "How do I accelerate PyTorch training with CUDA?",
    body: "Looking for practical ways to improve GPU utilization and reduce training time.",
    tags: ["PyTorch", "CUDA", "GPU"],
    answers: 5,
    views: 186,
  },
  {
    id: "sample-3",
    title: "Which embedding model should I use for RAG?",
    body: "Comparing embedding models for a retrieval-augmented generation application.",
    tags: ["LLMs", "RAG"],
    answers: 12,
    views: 421,
  },
];

const topics = ["All", "Python", "Machine Learning", "LLMs", "CUDA", "PyTorch"];

function App() {
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      setLoading(true);

      const [{ data: questionRows, error }, { data: answerRows }] =
        await Promise.all([
          supabase
            .from("questions")
            .select("id, title, body, tags, created_at")
            .order("created_at", { ascending: false }),
          supabase.from("answers").select("question_id"),
        ]);

      if (!active) return;

      if (error) {
        setMessage(`Could not load questions: ${error.message}`);
        setQuestions(sampleQuestions);
        setLoading(false);
        return;
      }

      const counts = new Map<string, number>();
      (answerRows ?? []).forEach((answer) => {
        counts.set(
          answer.question_id,
          (counts.get(answer.question_id) ?? 0) + 1,
        );
      });

      const realQuestions: Question[] = (questionRows ?? []).map((q) => ({
        id: q.id,
        title: q.title,
        body: q.body,
        tags: q.tags ?? [],
        created_at: q.created_at,
        answers: counts.get(q.id) ?? 0,
        views: 0,
      }));

      setQuestions(realQuestions.length ? realQuestions : sampleQuestions);
      setLoading(false);
    }

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (active) setUserId(data.user?.id ?? null);
    }

    void loadQuestions();
    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Please sign in before posting a question.");
      return;
    }

    const cleanTitle = title.trim();
    const cleanBody = body.trim();

    if (cleanTitle.length < 10 || cleanBody.length < 10) {
      setMessage("Title and description must each contain at least 10 characters.");
      return;
    }

    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 5);

    setSaving(true);

    const { data, error } = await supabase
      .from("questions")
      .insert({
        user_id: userId,
        title: cleanTitle,
        body: cleanBody,
        tags,
      })
      .select("id, title, body, tags, created_at")
      .single();

    setSaving(false);

    if (error) {
      setMessage(`Could not post question: ${error.message}`);
      return;
    }

    setQuestions((current) => [
      {
        ...data,
        tags: data.tags ?? [],
        answers: 0,
        views: 0,
      },
      ...current.filter((question) => !question.id.startsWith("sample-")),
    ]);

    setTitle("");
    setBody("");
    setTagsText("");
    setShowForm(false);
    setMessage("Your question was published.");
    setActiveTopic("All");
    setSearch("");
  }

  async function signIn() {
    const email = window.prompt("Enter your email address:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setMessage(
      error
        ? `Could not send sign-in link: ${error.message}`
        : "Check your email for your sign-in link.",
    );
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    setMessage(error ? error.message : "You have signed out.");
  }

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = `${question.title} ${question.body} ${question.tags.join(" ")}`
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
        <button className="nav-cta" onClick={userId ? signOut : signIn}>
          {userId ? "Sign out" : "Sign in"}
        </button>
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
              onClick={() => {
                setMessage("");
                setShowForm((open) => !open);
              }}
            >
              + Ask a question
            </button>
          </div>

          {message && <p role="status">{message}</p>}

          {showForm && (
            <form className="question-form" onSubmit={submitQuestion}>
              <h3>Ask the community</h3>
              {!userId && (
                <p>You need to sign in before publishing a question.</p>
              )}
              <label htmlFor="question-title">Title</label>
              <input
                id="question-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                minLength={10}
                maxLength={150}
                required
                placeholder="What do you need help with?"
              />
              <label htmlFor="question-body">Description</label>
              <textarea
                id="question-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                minLength={10}
                maxLength={10000}
                required
                rows={5}
                placeholder="Explain the problem and what you've tried..."
              />
              <label htmlFor="question-tags">Topics (comma-separated)</label>
              <input
                id="question-tags"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                placeholder="Python, Machine Learning"
              />
              <button type="submit" className="ask-button" disabled={saving}>
                {saving ? "Publishing..." : "Publish question"}
              </button>
            </form>
          )}

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

          {loading && <p>Loading questions...</p>}

          <div className="question-list">
            {filteredQuestions.map((question, index) => (
              <article className="question-card" key={question.id}>
                <div className="question-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="question-content">
                  <h3>{question.title}</h3>
                  <p>{question.body}</p>
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

            {!loading && filteredQuestions.length === 0 && (
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
