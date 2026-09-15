import type { PropsWithChildren } from "react";

type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "0 20px",
      }}
    >
      {children}
    </div>
  );
}
