"use client";

import { useSession } from "next-auth/react";
import styles from "./admin.module.css";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ judges: 0, criteria: 0, submissions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jRes, cRes, sRes] = await Promise.all([
          fetch("/api/admin/judges"),
          fetch("/api/admin/criteria"),
          fetch("/api/admin/submissions"),
        ]);

        if (!jRes.ok || !cRes.ok || !sRes.ok) {
          throw new Error("Failed to load dashboard stats. Please ensure you are logged in as an admin.");
        }

        const [j, c, s] = await Promise.all([jRes.json(), cRes.json(), sRes.json()]);
        
        setStats({
          judges: Array.isArray(j) ? j.length : 0,
          criteria: Array.isArray(c) ? c.length : 0,
          submissions: Array.isArray(s) ? s.length : 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className={styles.loading}>Loading Manage Panel...</div>;
  if (error) return <div className={styles.errorContainer}><p className={styles.errorMessage}>{error}</p></div>;

  return (
    <div className={styles.container}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1 className={styles.h1}>Manage Panel</h1>
        <p className={styles.p}>Platform Administration & Oversight</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass animate-fade-in`} style={{ animationDelay: '0.1s' }}>
          <span className={styles.label}>Judges</span>
          <span className={styles.value}>{stats.judges}</span>
        </div>
        <div className={`${styles.statCard} glass animate-fade-in`} style={{ animationDelay: '0.2s' }}>
          <span className={styles.label}>Criteria</span>
          <span className={styles.value}>{stats.criteria}</span>
        </div>
        <div className={`${styles.statCard} glass animate-fade-in`} style={{ animationDelay: '0.3s' }}>
          <span className={styles.label}>Submissions</span>
          <span className={styles.value}>{stats.submissions}</span>
        </div>
      </div>

      <div className={styles.quickActions}>
        <Link href="/admin/judges" className="glass animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Manage Judges
        </Link>
        <Link href="/admin/criteria" className="glass animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Manage Criteria
        </Link>
        <Link href="/admin/submissions" className="glass animate-fade-in" style={{ animationDelay: '0.6s' }}>
          View Submissions
        </Link>
      </div>
    </div>
  );
}
