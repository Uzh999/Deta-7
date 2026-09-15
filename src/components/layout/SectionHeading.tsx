import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  /** Small uppercase label above the title. */
  kicker?: string;
  /** Centers the block and its text. Defaults to left-aligned. */
  align?: "start" | "center";
};

export default function SectionHeading({
  title,
  subtitle,
  kicker,
  align = "start",
}: SectionHeadingProps) {
  return (
    <header
      className={`${styles.heading} ${align === "center" ? styles.center : ""}`}
    >
      {kicker && <span className={styles.kicker}>{kicker}</span>}

      <h2 className={styles.title}>{title}</h2>

      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
