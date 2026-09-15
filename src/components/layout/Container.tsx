import type { PropsWithChildren } from "react";
import styles from "./Container.module.css";

type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

/**
 * Centers content at the site's max width with a responsive side gutter.
 * Previously styled inline, which meant the padding could not respond to
 * breakpoints and could not be overridden by a caller.
 */
export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div className={`${styles.container} ${className}`.trim()}>{children}</div>
  );
}
