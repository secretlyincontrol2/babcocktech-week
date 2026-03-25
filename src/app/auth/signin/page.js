"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./signin.module.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <main className={styles.container}>
      <div className={`${styles.card} glass animate-fade-in`}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/assets/BTW 26 ASSETS/Colorful Logo.svg" 
            alt="BTW 26 Logo" 
            width={120} 
            height={120} 
            priority
          />
        </div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Login to your account to continue</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="admin@tethered.com" 
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
      
      <div className={styles.footer}>
        Tethered Hackathon & Ideathon 2026
      </div>
    </main>
  );
}
