"use client";

import { useSession } from "next-auth/react";
import MagnetLines from "@/components/MagnetLines";
import ClickSpark from "@/components/ClickSpark";
import styles from "./home.module.css";
import Image from "next/image";
import Link from "next/link";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push(session.user.role === "ADMIN" ? "/admin" : "/judge");
    }
  }, [status, session, router]);

  return (
    <main className={styles.main}>
      <ClickSpark 
        sparkColor="#ffffff"
        sparkSize={10}
        sparkRadius={20}
        duration={400}
      />
      
      {/* Premium Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/assets/BTW 26 ASSETS/Colorful Logo.svg" 
            alt="BTW 26 Logo" 
            width={70} 
            height={70} 
            className={styles.brandLogo}
          />
          <div className={styles.logoText}>
            <span className={styles.title2026}>BTW 2026</span>
            <span className={styles.subtitleTag}>MAGNETIC FUTURE</span>
          </div>
        </div>
        <div className={styles.navLinks}>
          <Link href="/auth/signin" className={styles.navLink}>Judge Portal</Link>
        </div>
      </nav>
      
      <section className={styles.heroSection}>
        {/* Immersive Background Effect */}
        <div className={styles.visualCanvas}>
          <MagnetLines
            rows={15}
            columns={18}
            containerSize="120vmin"
            lineColor="rgba(112, 0, 255, 0.45)"
            lineWidth="1px"
            lineHeight="40px"
            baseAngle={45}
            style={{ opacity: 0.8, filter: 'blur(0.5px)' }}
          />
          <div className={styles.gradientOverlay} />
        </div>

        {/* Content Layer */}
        <div className={`${styles.mainContent} animate-fade-in`}>
          <div className={styles.eventBadge}>
            <span className={styles.pulseDot} />
            TETHERED HACKATHON & IDEATHON
          </div>

          <div className={styles.typographyBox}>
            <h1 className={styles.mainTitle}>
              <span className={styles.wordUpper}>IGNITING</span>
              <span className={styles.wordCore}>THE BRAIN</span>
              <div className={styles.wavesBox}>
                <span className={styles.wordLower}>THROUGH WAVES</span>
              </div>
            </h1>
          </div>

          <p className={styles.heroDescription}>
            Building the next generation of tethered innovation. 
            Join the magnetic force of ideation.
          </p>
          
          <div className={styles.actions}>
            {!session ? (
              <div className={styles.dualActions}>
                <Link href="/auth/signin" className={styles.premiumCTA}>
                  <span className={styles.ctaText}>Judge Entrance</span>
                </Link>
                <Link href="/auth/signin" className={`${styles.premiumCTA} ${styles.outlineCTA}`}>
                  <span className={styles.ctaText}>Admin Portal</span>
                </Link>
              </div>
            ) : (
              <Link href={session.user.role === "ADMIN" ? "/admin" : "/judge"} className={styles.premiumCTA}>
                <span className={styles.ctaText}>Enter Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className={styles.footerBar}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>© 2026 TETHERED</div>
          <div className={styles.footerRight}>
            <span className={styles.status}>● SYSTEM READY</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
