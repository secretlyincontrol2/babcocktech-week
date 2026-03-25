"use client";

import { useEffect, useState } from "react";
import styles from "./logs.module.css";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch logs");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Activity Logs</h1>
        <p className={styles.subtitle}>Monitor administrative and judging actions</p>
      </header>

      <div className={`${styles.logsWrapper} glass`}>
        {error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : loading ? (
          <div className={styles.loading}>Loading logs...</div>
        ) : (
          <div className={styles.logList}>
            {logs.map((log) => (
              <div key={log.id} className={styles.logItem}>
                <div className={styles.logMain}>
                  <span className={styles.action}>{log.action.replace(/_/g, " ")}</span>
                  <span className={styles.details}>{log.details}</span>
                </div>
                <div className={styles.logMeta}>
                  <span className={styles.user}>{log.user?.email || "Unknown"}</span>
                  <span className={styles.date}>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {logs.length === 0 && <div className={styles.empty}>No activity logs yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
