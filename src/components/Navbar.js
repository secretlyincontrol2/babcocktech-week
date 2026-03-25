"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./navbar.module.css";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  return (
    <nav className={`${styles.nav} glass`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/assets/BTW 26 ASSETS/White on Black round corners.svg" 
            alt="Logo" 
            width={40} 
            height={40} 
          />
          <span>BTW 2026</span>
        </Link>

        <div className={styles.links}>
          {isAdmin ? (
            <>
              <Link href="/admin" className={pathname === "/admin" ? styles.active : ""}>Status</Link>
              <Link href="/admin/judges" className={pathname === "/admin/judges" ? styles.active : ""}>Judges</Link>
              <Link href="/admin/criteria" className={pathname === "/admin/criteria" ? styles.active : ""}>Criteria</Link>
              <Link href="/admin/submissions" className={pathname === "/admin/submissions" ? styles.active : ""}>Submissions</Link>
              <Link href="/admin/logs" className={pathname === "/admin/logs" ? styles.active : ""}>Logs</Link>
            </>
          ) : (
            <>
              <Link href="/judge" className={pathname === "/judge" ? styles.active : ""}>Dashboard</Link>
            </>
          )}
        </div>

        <div className={styles.user}>
          <span className={styles.userName}>{session.user.name || session.user.email}</span>
          <button onClick={() => signOut()} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
