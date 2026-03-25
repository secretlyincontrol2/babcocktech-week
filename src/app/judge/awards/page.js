"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../judge.module.css";

export default function JudgeAwards() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/judge/awards");
      const data = await res.json();
      if (Array.isArray(data)) {
        const enhanced = data.map(sub => {
          const total = sub.ratings.reduce((acc, r) => acc + r.score, 0);
          const uniqueJudges = [...new Set(sub.ratings.map(r => r.userId))];
          const judgeCount = uniqueJudges.length;
          return {
            ...sub,
            totalScore: total,
            avgScore: judgeCount > 0 ? (total / sub.ratings.length).toFixed(1) : "0.0",
            judgeCount
          };
        });
        setSubmissions(enhanced.sort((a, b) => b.totalScore - a.totalScore));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSetWinner = async (id, category) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/judge/awards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, winnerCategory: category })
      });
      if (res.ok) fetchSubmissions();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Awards Panel...</div>;

  return (
    <div className={styles.container}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Judge Dashboard</h1>
        <p>Review and evaluate project submissions</p>
        
        <div className={styles.tabs}>
          <Link href="/judge" className={styles.tab}>Evaluations</Link>
          <Link href="/judge/awards" className={`${styles.tab} ${styles.activeTab}`}>Awards</Link>
        </div>
      </header>

      <div className={styles.list}>
        {submissions.map((sub, index) => (
          <div key={sub.id} className={`${styles.card} glass animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
            {sub.winnerCategory && (
              <div className={styles.winnerBadge}>{sub.winnerCategory}</div>
            )}
            <div className={styles.info}>
              <h3 className={styles.titleSmall}>{sub.title}</h3>
              <p>{sub.ownerName || "Team"} • {sub.avgScore} Avg Score</p>
            </div>
            
            <div className={styles.winnerAction}>
              <input 
                type="text" 
                placeholder="e.g. Best UI/UX" 
                defaultValue={sub.winnerCategory || ""}
                id={`winner-${sub.id}`}
                className={styles.winnerInput}
              />
              <button 
                onClick={() => {
                  const val = document.getElementById(`winner-${sub.id}`).value;
                  handleSetWinner(sub.id, val);
                }}
                disabled={updatingId === sub.id}
                className={styles.winnerBtn}
              >
                {updatingId === sub.id ? "..." : "Assign Award"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {submissions.length === 0 && (
        <div className={styles.empty}>
          <p>No projects available for awards.</p>
        </div>
      )}
    </div>
  );
}
