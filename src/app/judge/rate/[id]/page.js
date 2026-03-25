"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import styles from "./rate.module.css";

export default function RateSubmission({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const [submission, setSubmission] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [subRes, critRes] = await Promise.all([
        fetch("/api/submissions"),
        fetch("/api/admin/criteria")
      ]);
      
      if (!subRes.ok || !critRes.ok) {
        throw new Error(`Failed to fetch: Submissions (${subRes.status}) | Criteria (${critRes.status})`);
      }

      const subs = await subRes.json();
      const crits = await critRes.json();
      
      if (!Array.isArray(subs)) throw new Error("Invalid submissions data received");
      
      const sub = subs.find(s => s.id === id);
      if (!sub) throw new Error("Project not found");

      const criteriaList = Array.isArray(crits) ? crits : [];
      
      setSubmission(sub);
      setCriteria(criteriaList);

      // Initialize scores from previous ratings if they exist
      const initialScores = {};
      const initialComments = {};
      criteriaList.forEach(c => {
        const prevRating = sub?.ratings?.find(r => r.criterionId === c.id);
        initialScores[c.id] = prevRating ? prevRating.score : 0;
        initialComments[c.id] = prevRating ? prevRating.comment : "";
      });
      setScores(initialScores);
      setComments(initialComments);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (critId, val) => {
    setScores(prev => ({ ...prev, [critId]: parseInt(val) }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setValidationError("");

    // Validate: all criteria must be scored above 0
    const unscored = criteria.filter(c => !scores[c.id] || scores[c.id] <= 0);
    if (unscored.length > 0) {
      const names = unscored.map(c => c.name).join(", ");
      setValidationError(`Please score all criteria before submitting. Missing: ${names}`);
      return;
    }

    setSaving(true);

    try {
      const ratingPromises = Object.entries(scores).map(([critId, score]) => 
        fetch("/api/judge/rate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId: id, criterionId: critId, score }),
        })
      );

      await Promise.all(ratingPromises);
      router.push("/judge");
    } catch (err) {
      console.error(err);
      setValidationError("Failed to submit evaluation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Project Details...</div>;
  if (error) return (
    <div className={styles.errorContainer}>
      <div className={`${styles.errorCard} glass`}>
        <h2>Evaluation Error</h2>
        <p>{error}</p>
        <button onClick={() => fetchData()} className={styles.retryBtn}>Retry Connection</button>
        <button onClick={() => router.back()} className={styles.backBtnSmall}>Return to Hub</button>
      </div>
    </div>
  );
  if (!submission) return <div className={styles.loading}>Project data missing.</div>;

  const totalPossible = criteria.reduce((acc, c) => acc + c.maxScore, 0);
  const currentTotal = Object.values(scores).reduce((acc, s) => acc + s, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19L5 12L12 5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>
        
        <div className={`${styles.projectInfo} glass animate-fade-in`}>
          <span className={styles.owner}>{submission.ownerName || "Team"}</span>
          <h1>{submission.title}</h1>
          <p className={styles.projectDescription}>{submission.description}</p>
          
          <div className={styles.links}>
            {submission.githubUrl && (
              <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                Repository
              </a>
            )}
            {submission.demoUrl && (
              <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                Live Demo
              </a>
            )}
          </div>
        </div>
      </header>

      <div className={styles.ratingSection}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.criteriaList}>
            {criteria.map((c, index) => (
              <div 
                key={c.id} 
                className={`${styles.criterion} glass animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.critInfo}>
                  <label>{c.name}</label>
                  <div className={styles.scoreDisplay}>
                    <span className={styles.scoreValue}>{scores[c.id]}</span>
                    <span className={styles.maxScore}>of {c.maxScore}</span>
                  </div>
                </div>
                <div className={styles.sliderWrapper}>
                  <input 
                    type="range" 
                    min="0" 
                    max={c.maxScore} 
                    value={scores[c.id]} 
                    onChange={(e) => handleScoreChange(c.id, e.target.value)}
                    className={styles.slider}
                  />
                </div>
              </div>
            ))}
          </div>
        </form>

        <aside className={`${styles.summaryCard} glass animate-fade-in`} style={{ animationDelay: '0.4s' }}>
          <h2 className={styles.summaryTitle}>Evaluation Summary</h2>
          <div className={styles.totalScore}>{currentTotal}</div>
          <span className={styles.totalPossible}>Total out of {totalPossible}</span>
          
          {validationError && (
            <div className={styles.validationError}>{validationError}</div>
          )}

          <button 
            onClick={handleSubmit} 
            disabled={saving} 
            className={styles.submitBtn}
          >
            {saving ? "Submitting..." : "Submit Evaluation"}
          </button>
        </aside>
      </div>
    </div>
  );
}
