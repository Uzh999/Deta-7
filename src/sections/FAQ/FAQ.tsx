import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../components/layout/Container";
import SectionHeading from "../../components/layout/SectionHeading";
import styles from "./FAQ.module.css";

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export default function FAQ() {
  const { t } = useTranslation();
  const items = useMemo(
    () =>
      faqKeys.map((key) => ({
        key,
        question: t(`faq.items.${key}.question`),
        answer: t(`faq.items.${key}.answer`),
      })),
    [t],
  );

  const [openKey, setOpenKey] = useState<(typeof faqKeys)[number] | null>("q1");

  const toggleItem = (key: (typeof faqKeys)[number]) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <section id="faq" className={styles.section}>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.intro}>
            <div className={styles.kicker}>{t("faq.kicker")}</div>

            <SectionHeading
              title={t("faq.title")}
              subtitle={t("faq.subtitle")}
            />

            <p className={styles.description}>{t("faq.description")}</p>
          </div>

          <div className={styles.list}>
            {items.map((item) => {
              const isOpen = openKey === item.key;

              return (
                <article
                  key={item.key}
                  className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
                >
                  <button
                    type="button"
                    className={styles.question}
                    onClick={() => toggleItem(item.key)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.key}`}
                  >
                    <span className={styles.questionText}>{item.question}</span>

                    <span className={styles.iconWrap} aria-hidden="true">
                      <span
                        className={`${styles.iconLine} ${styles.iconLineHorizontal}`}
                      />
                      <span
                        className={`${styles.iconLine} ${styles.iconLineVertical} ${
                          isOpen ? styles.iconLineVerticalOpen : ""
                        }`}
                      />
                    </span>
                  </button>

                  <div
                    id={`faq-panel-${item.key}`}
                    className={`${styles.answerWrap} ${
                      isOpen ? styles.answerWrapOpen : ""
                    }`}
                  >
                    <div className={styles.answerInner}>
                      <p className={styles.answer}>{item.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
