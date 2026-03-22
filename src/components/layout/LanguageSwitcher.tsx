import { useNavigate, useParams } from "react-router-dom";
import styles from "./LanguageSwitcher.module.css";

const languages = [
  { code: "pl", label: "PL" },
  { code: "uk", label: "UA" },
  { code: "ru", label: "RU" },
];

export default function LanguageSwitcher() {
  const navigate = useNavigate();
  const { lang } = useParams();

  return (
    <div className={styles.switcher}>
      {languages.map((item) => {
        const isActive = lang === item.code;

        return (
          <button
            key={item.code}
            type="button"
            onClick={() => navigate(`/${item.code}`)}
            className={`${styles.button} ${isActive ? styles.active : ""}`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
