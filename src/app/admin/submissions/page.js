"use client";

import { useState, useEffect } from "react";
import styles from "./submissions.module.css";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    teamName: "", projectTitle: "", description: "", githubUrl: "", demoUrl: ""
  });
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSubmissions = () => {
    fetch("/api/admin/submissions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const enhanced = data.map(sub => {
            const total = sub.ratings.reduce((acc, r) => acc + r.score, 0);
            const uniqueJudges = [...new Set(sub.ratings.map(r => r.user?.name || r.userId))];
            const judgeCount = uniqueJudges.length;
            return {
              ...sub,
              totalScore: total,
              avgScore: judgeCount > 0 ? (total / sub.ratings.length).toFixed(1) : "0.0",
              judgeCount
            };
          });
          setSubmissions(enhanced);
        }
      });
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSetWinner = async (id, category) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/submissions", {
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

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchSubmissions();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.teamName || !formData.projectTitle || !formData.description) return;
    setCreating(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ teamName: "", projectTitle: "", description: "", githubUrl: "", demoUrl: "" });
        setShowForm(false);
        fetchSubmissions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1>Manage Submissions</h1>
            <p>Review projects and track evaluations</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
            {showForm ? "Cancel" : "+ Add Project"}
          </button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={handleCreate} className={`${styles.addForm} glass animate-fade-in`}>
          <h3 className={styles.formTitle}>Register New Project</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Team Name *</label>
              <input
                value={formData.teamName}
                onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                placeholder="e.g. Team Alpha"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Project Title *</label>
              <input
                value={formData.projectTitle}
                onChange={(e) => setFormData({...formData, projectTitle: e.target.value})}
                placeholder="e.g. Smart Campus App"
                required
              />
            </div>
            <div className={styles.formGroup + " " + styles.fullWidth}>
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief project description..."
                rows={3}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>GitHub URL</label>
              <input
                value={formData.githubUrl}
                onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                placeholder="https://github.com/..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Demo URL</label>
              <input
                value={formData.demoUrl}
                onChange={(e) => setFormData({...formData, demoUrl: e.target.value})}
                placeholder="https://..."
              />
            </div>
          </div>
          <button type="submit" disabled={creating} className={styles.submitFormBtn}>
            {creating ? "Adding..." : "Add Project"}
          </button>
        </form>
      )}

      <div className={styles.grid}>
        {submissions.map((sub) => (
          <div key={sub.id} className={`${styles.card} glass`}>
            {sub.winnerCategory && (
              <div className={styles.winnerBadge}>{sub.winnerCategory}</div>
            )}
            <div className={styles.cardHeader}>
              <h3>{sub.title}</h3>
              <span className={styles.avgScore}>{sub.avgScore} <small>avg</small></span>
            </div>
            <p className={styles.owner}>{sub.ownerName}</p>
            
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span>Total Pts</span>
                <strong>{sub.totalScore}</strong>
              </div>
              <div className={styles.stat}>
                <span>Judges</span>
                <strong>{sub.judgeCount}</strong>
              </div>
            </div>

            <button 
              onClick={() => handleDelete(sub.id, sub.title)}
              className={styles.deleteProjectBtn}
              disabled={updatingId === sub.id}
            >
              {updatingId === sub.id ? "..." : "Delete Project"}
            </button>
          </div>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className={styles.empty}>No projects registered yet. Click "+ Add Project" above to get started.</div>
      )}
    </div>
  );
}
