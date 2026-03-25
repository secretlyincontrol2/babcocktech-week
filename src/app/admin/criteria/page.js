"use client";

import { useState, useEffect } from "react";
import styles from "./criteria.module.css";

export default function CriteriaManagement() {
  const [criteria, setCriteria] = useState([]);
  const [name, setName] = useState("");
  const [maxScore, setMaxScore] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    const res = await fetch("/api/admin/criteria");
    const data = await res.json();
    if (Array.isArray(data)) setCriteria(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, maxScore }),
    });

    if (res.ok) {
      setName("");
      setMaxScore(10);
      fetchCriteria();
    }
    setLoading(false);
  };

  const handleDelete = async (id, criterionName) => {
    if (!confirm(`Delete "${criterionName}"? This will also remove all related ratings.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/criteria", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchCriteria();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Manage Criteria</h1>
        <p>Add or remove the parameters judges will use to evaluate submissions</p>
      </header>

      <div className={styles.grid}>
        <section className={`${styles.formSection} glass`}>
          <h2 className={styles.titleSmall}>Add New Criterion</h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Criterion Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design, Innovation" className={styles.inputField} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Max Score</label>
              <input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} min="1" max="100" className={styles.inputField} required />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "Adding..." : "Add Criterion"}
            </button>
          </form>
        </section>

        <section className={styles.listSection}>
          <h2 className={styles.titleSmall}>Active Criteria ({criteria.length})</h2>
          <div className={styles.cardsGrid}>
            {criteria.map((c) => (
              <div key={c.id} className={`${styles.card} glass`}>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{c.name}</h3>
                  <div className={styles.maxScore}>Max: {c.maxScore} pts</div>
                </div>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  disabled={deletingId === c.id}
                  className={styles.deleteBtn}
                >
                  {deletingId === c.id ? "..." : "Remove"}
                </button>
              </div>
            ))}
            {criteria.length === 0 && (
              <p className={styles.emptyMsg}>No criteria added yet. Add one above to get started.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
