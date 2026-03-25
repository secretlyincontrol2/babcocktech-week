"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./judge.module.css";

export default function JudgeDashboard() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revertingId, setRevertingId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (Array.isArray(data)) setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (submissionId) => {
    if (!confirm("Are you sure you want to revert this submission? All your scores will be removed.")) return;
    setRevertingId(submissionId);
    try {
      const res = await fetch("/api/judge/rate", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      if (res.ok) {
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevertingId(null);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Submissions...</div>;

  const currentUserId = session?.user?.id;

  return (
    <div className={styles.container}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Judge Dashboard</h1>
        <p>Review and evaluate project submissions</p>
        
        <div className={styles.tabs}>
          <Link href="/judge" className={`${styles.tab} ${styles.activeTab}`}>Evaluations</Link>
          <Link href="/judge/awards" className={styles.tab}>Awards</Link>
        </div>
      </header>

      <div className={styles.list}>
        {submissions.map((sub, index) => {
          const myRatings = sub.ratings?.filter(r => r.userId === currentUserId) || [];
          const isRated = myRatings.length > 0;
          
          return (
            <div 
              key={sub.id} 
              className={`${styles.card} glass animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className={`${styles.statusIndicator} ${isRated ? styles.rated : styles.pending}`} />
              
              {isRated && (
                <div className={styles.submittedBadge}>Submitted</div>
              )}

              <div className={styles.info}>
                <h3 className={styles.titleSmall}>{sub.title}</h3>
                <p>{sub.ownerName || "Team"}</p>
              </div>

              <div className={styles.actions}>
                {isRated ? (
                  <>
                    <Link href={`/judge/rate/${sub.id}`} className={styles.editBtn}>
                      Edit Evaluation
                    </Link>
                    <button 
                      onClick={() => handleRevert(sub.id)}
                      disabled={revertingId === sub.id}
                      className={styles.revertBtn}
                    >
                      {revertingId === sub.id ? "Reverting..." : "Revert Submission"}
                    </button>
                  </>
                ) : (
                  <Link href={`/judge/rate/${sub.id}`} className={styles.rateBtn}>
                    Begin Evaluation
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {submissions.length === 0 && (
        <div className={styles.empty}>
          <p>No submissions awaiting evaluation.</p>
        </div>
      )}
    </div>
  );
}
