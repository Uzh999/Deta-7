import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import styles from "./BeforeAfter.module.css";

import car1Before from "../../assets/images/before-after/car1-before.jpg";
import car1After from "../../assets/images/before-after/car1-after.jpg";

import carBefore from "../../assets/images/before-after/1.jpg";
import carAfter from "../../assets/images/before-after/2.jpg";

type SliderItem = {
  before: string;
  after: string;
  /** Intrinsic size, reserved so the image never shifts layout while loading. */
  width: number;
  height: number;
};

const SLIDER_ITEMS: SliderItem[] = [
  { before: car1Before, after: car1After, width: 960, height: 1280 },
  { before: carBefore, after: carAfter, width: 1080, height: 1080 },
];

const KEYBOARD_STEP = 4;
const KEYBOARD_STEP_LARGE = 12;

type SliderProps = SliderItem & {
  /** First slider is above the fold on tall screens; it loads eagerly. */
  priority: boolean;
};

function BeforeAfterSlider({
  before,
  after,
  width,
  height,
  priority,
}: SliderProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const node = containerRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    if (rect.width === 0) return;

    const percent = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, percent)));
  }, []);

  // A single pointer pipeline replaces the previous separate mouse and touch
  // handlers. Pointer capture keeps the drag alive when the cursor leaves the
  // element, which the old mouseleave-cancels-drag approach could not do.
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updatePosition(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(event.clientX);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;

    const next = {
      ArrowLeft: () => position - step,
      ArrowRight: () => position + step,
      ArrowDown: () => position - step,
      ArrowUp: () => position + step,
      Home: () => 0,
      End: () => 100,
      PageDown: () => position - KEYBOARD_STEP_LARGE,
      PageUp: () => position + KEYBOARD_STEP_LARGE,
    }[event.key];

    if (!next) return;

    event.preventDefault();
    setPosition(Math.max(0, Math.min(100, next())));
  };

  const rounded = Math.round(position);

  return (
    <div
      ref={containerRef}
      className={`${styles.slider} ${isDragging ? styles.dragging : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      role="slider"
      tabIndex={0}
      aria-label={t("beforeAfter.sliderLabel")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={rounded}
      aria-valuetext={`${rounded}%`}
      aria-orientation="horizontal"
    >
      <img
        src={before}
        alt={t("beforeAfter.altBefore")}
        className={styles.image}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
      />

      <div
        className={styles.afterLayer}
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img
          src={after}
          alt={t("beforeAfter.altAfter")}
          className={styles.image}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
      </div>

      <div className={styles.labels} aria-hidden="true">
        <span className={styles.labelLeft}>{t("beforeAfter.before")}</span>
        <span className={styles.labelRight}>{t("beforeAfter.after")}</span>
      </div>

      <div
        className={styles.divider}
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <div className={styles.handle}>
          <svg viewBox="0 0 24 24" className={styles.handleIcon} focusable="false">
            <path
              d="M10 7 6 12l4 5M14 7l4 5-4 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

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
          {SLIDER_ITEMS.map((item, index) => (
            <BeforeAfterSlider
              key={item.before}
              {...item}
              priority={index === 0}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
