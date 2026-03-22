import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import styles from "./BeforeAfter.module.css";

import car1Before from "../../assets/images/before-after/car1-before.jpg";
import car1After from "../../assets/images/before-after/car1-after.jpg";

import carBefore from "../../assets/images/before-after/1.jpg";
import carAfter from "../../assets/images/before-after/2.jpg";

type SliderProps = {
  before: string;
  after: string;
};

function BeforeAfterSlider({ before, after }: SliderProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = (x / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, percent));

    setPosition(clamped);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.slider} ${isDragging ? styles.dragging : ""}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="presentation"
    >
      <img src={before} alt="Before detailing" className={styles.image} />

      <div
        className={styles.afterLayer}
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img src={after} alt="After detailing" className={styles.image} />
      </div>

      <div className={styles.labels}>
        <span className={styles.labelLeft}>{t("beforeAfter.before")}</span>
        <span className={styles.labelRight}>{t("beforeAfter.after")}</span>
      </div>

      <div className={styles.divider} style={{ left: `${position}%` }}>
        <div className={styles.handle}>
          <span className={styles.handleArrow}>‹</span>
          <span className={styles.handleArrow}>›</span>
        </div>
      </div>
    </div>
  );
}

const sliderItems = [
  {
    before: car1Before,
    after: car1After,
  },
  {
    before: carBefore,
    after: carAfter,
  },
];

export default function BeforeAfter() {
  const { t } = useTranslation();

  return (
    <section id="before-after" className={styles.section}>
      <Container>
        <SectionHeading
          title={t("beforeAfter.title")}
          subtitle={t("beforeAfter.subtitle")}
        />

        <div className={styles.grid}>
          {sliderItems.map((item, index) => (
            <BeforeAfterSlider
              key={index}
              before={item.before}
              after={item.after}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
