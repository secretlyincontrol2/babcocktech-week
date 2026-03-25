"use client";

import { useState, useEffect } from "react";
import styles from "./judges.module.css";

export default function JudgeManagement() {
  const [judges, setJudges] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchJudges();
  }, []);

  const fetchJudges = async () => {
    const res = await fetch("/api/admin/judges");
    const data = await res.json();
    if (Array.isArray(data)) setJudges(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/judges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      setMessage("Judge created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      fetchJudges();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to create judge");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Manage Judges</h1>
        <p>Create and manage judge accounts for the hackathon</p>
      </header>

      <div className={styles.grid}>
        <section className={`${styles.formSection} glass`}>
          <h2 className={styles.titleSmall}>Create New Judge</h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" className={styles.inputField} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="judge@example.com" className={styles.inputField} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={styles.inputField} required />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "Creating..." : "Add Judge"}
            </button>
            {message && <div className={styles.message}>{message}</div>}
          </form>
        </section>

        <section className={`${styles.listSection} glass`}>
          <h2 className={styles.titleSmall}>Active Judges</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeader}>Name</th>
                  <th className={styles.tableHeader}>Email</th>
                  <th className={styles.tableHeader}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {judges.map((judge) => (
                  <tr key={judge.id}>
                    <td className={styles.tableCell}>{judge.name || "N/A"}</td>
                    <td className={styles.tableCell}>{judge.email}</td>
                    <td className={styles.tableCell}>{new Date(judge.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
