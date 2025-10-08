import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

type HeaderProps = {
  children: ReactNode;
  className?: string;
};

type ContentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Section component with composition API for consistent layout
 * Follows the same spacing pattern as Group component:
 * - Header: px-4 py-3
 * - Content: p-4 pt-0
 */
function Section({ children, className = "" }: SectionProps) {
  return (
    <div className={`border-t border-s-01 first:border-t-0 ${className}`}>
      {children}
    </div>
  );
}

function Header({ children, className = "" }: HeaderProps) {
  return (
    <div
      className={`flex justify-between items-center min-h-12 px-4 py-3 ${className}`}
    >
      {children}
    </div>
  );
}

function Content({ children, className = "" }: ContentProps) {
  return <div className={`p-4 pt-0 ${className}`}>{children}</div>;
}

Section.Header = Header;
Section.Content = Content;

export default Section;
