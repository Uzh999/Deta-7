import { useCallback, useEffect, useId, useRef, useState } from "react";

import styles from "./SelectField.module.css";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  name: string;
  label: string;
  /** Shown on the trigger while nothing is chosen. */
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** Shown instead of the browser's bubble when a required field is empty. */
  requiredMessage?: string;
};

/** How long consecutive keystrokes count as one type-ahead query. */
const TYPEAHEAD_RESET_MS = 700;

/**
 * A select-only combobox (WAI-ARIA 1.2): focus stays on the trigger and the
 * active option is pointed at with `aria-activedescendant`, which behaves far
 * more predictably across screen readers than moving focus into the list.
 *
 * The native control was replaced because it renders with the operating
 * system's own palette — a white menu dropped onto a black page — and nothing
 * in CSS can reach inside it.
 */
export default function SelectField({
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  required = false,
  requiredMessage,
}: SelectFieldProps) {
  const reactId = useId();
  const labelId = `${reactId}-label`;
  const triggerId = `${reactId}-trigger`;
  const listboxId = `${reactId}-listbox`;
  const errorId = `${reactId}-error`;
  const optionId = (index: number) => `${reactId}-option-${index}`;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showRequiredError, setShowRequiredError] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ query: "", at: 0 });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex].label : "";

  const open = useCallback(
    (index: number) => {
      setActiveIndex(
        Math.min(Math.max(index, 0), Math.max(options.length - 1, 0)),
      );
      setIsOpen(true);
    },
    [options.length],
  );

  const close = useCallback((returnFocus = true) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      onChange(option.value);
      setShowRequiredError(false);
      close();
    },
    [close, onChange, options],
  );

  /* Pointer-down rather than click: a click that starts inside the list and
     ends outside should not count as dismissing it. */
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  /* Keep the active option in view without scrolling the page itself. */
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const el = document.getElementById(optionId(activeIndex));
    el?.scrollIntoView({ block: "nearest" });
    // optionId is derived from a stable useId, so it needs no dependency entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex]);

  const moveActive = (delta: number) => {
    setActiveIndex((current) => {
      const from = current < 0 ? selectedIndex : current;
      const next = (from < 0 ? 0 : from) + delta;
      return Math.min(Math.max(next, 0), options.length - 1);
    });
  };

  const runTypeahead = (char: string) => {
    const now = Date.now();
    const state = typeahead.current;
    state.query = now - state.at > TYPEAHEAD_RESET_MS ? char : state.query + char;
    state.at = now;

    const match = options.findIndex((option) =>
      option.label.toLocaleLowerCase().startsWith(state.query.toLocaleLowerCase()),
    );

    if (match < 0) return;
    if (isOpen) setActiveIndex(match);
    else commit(match);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) open(selectedIndex >= 0 ? selectedIndex : 0);
        else moveActive(1);
        break;

      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) open(selectedIndex >= 0 ? selectedIndex : options.length - 1);
        else moveActive(-1);
        break;

      case "Home":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;

      case "End":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;

      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen) commit(activeIndex);
        else open(selectedIndex >= 0 ? selectedIndex : 0);
        break;

      case "Escape":
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;

      case "Tab":
        if (isOpen) close(false);
        break;

      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          runTypeahead(event.key);
        }
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* Buttons cannot be the target of `for`, so the label is wired up with
          aria-labelledby and made clickable by hand. */}
      <span
        id={labelId}
        className={styles.label}
        onClick={() => triggerRef.current?.focus()}
      >
        {label}
      </span>

      <div className={styles.control}>
        <button
          type="button"
          id={triggerId}
          ref={triggerRef}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${triggerId}`}
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-describedby={showRequiredError ? errorId : undefined}
          aria-invalid={showRequiredError || undefined}
          className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""} ${
            showRequiredError ? styles.triggerInvalid : ""
          }`}
          onClick={() => {
            if (isOpen) close(false);
            else open(selectedIndex >= 0 ? selectedIndex : 0);
          }}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedLabel ? styles.value : styles.placeholder}>
            {selectedLabel || placeholder}
          </span>

          <span className={styles.arrow} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polyline
                points="6 9 12 15 18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <ul
            id={listboxId}
            ref={listboxRef}
            role="listbox"
            aria-labelledby={labelId}
            className={styles.listbox}
            tabIndex={-1}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${isActive ? styles.optionActive : ""} ${
                    isSelected ? styles.optionSelected : ""
                  }`}
                  /* Mouse down would steal focus from the trigger before the
                     click lands, which drops aria-activedescendant. */
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>

                  {isSelected && (
                    <span className={styles.check} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline
                          points="20 6 9 17 4 12"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Carries the value into the form and keeps native `required`
            validation working. It is focusable only to the browser's own
            constraint check, which we intercept to show a styled message in
            the page's language instead of an OS bubble. */}
        <input
          className={styles.validationProxy}
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={value}
          required={required}
          /* Deliberately not `readOnly`: the browser skips constraint
             validation entirely on a read-only field, so `required` would
             never fire. It is unreachable by pointer and keyboard anyway. */
          onChange={() => {}}
          onInvalid={(event) => {
            event.preventDefault();
            setShowRequiredError(true);
            triggerRef.current?.focus();
          }}
        />
      </div>

      {showRequiredError && requiredMessage && (
        <p id={errorId} className={styles.error}>
          {requiredMessage}
        </p>
      )}
    </div>
  );
}
