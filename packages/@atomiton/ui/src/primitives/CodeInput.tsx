import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";

import { cn } from "#utils";

export type CodeInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  height?: string;
  className?: string;
  id?: string;
  "data-testid"?: string;
};

/**
 * A code editor component built on CodeMirror 6 with syntax highlighting
 * for JavaScript/TypeScript/JSX.
 *
 * Features:
 * - Syntax highlighting with VSCode Dark theme
 * - Auto-indentation and bracket matching
 * - Code completion
 * - Line numbers
 * - Configurable height
 *
 * @example
 * ```tsx
 * <CodeInput
 *   value={code}
 *   onChange={setCode}
 *   placeholder="Enter JavaScript code..."
 *   height="20rem"
 * />
 * ```
 */
function CodeInput({
  value = "",
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  height = "15rem",
  className,
  id,
  "data-testid": dataTestId,
}: CodeInputProps) {
  return (
    <CodeMirror
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      editable={!disabled && !readOnly}
      readOnly={readOnly}
      height={height}
      theme={vscodeDark}
      extensions={[javascript({ jsx: true, typescript: true })]}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        foldGutter: false,
        dropCursor: true,
        allowMultipleSelections: true,
        indentOnInput: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        highlightActiveLine: true,
      }}
      className={cn(
        // Base styles matching Input component
        "w-full text-primary outline-0 text-body-md shadow-none",
        // Default variant styles to match Input
        "border border-surface-03 bg-surface-03 rounded-[0.625rem] transition-colors",
        // Focus states
        "focus-within:border-s-02 focus-within:bg-surface-02",
        // CodeMirror specific
        "overflow-hidden font-mono text-xs",
        className,
      )}
      data-testid={dataTestId}
    />
  );
}

export { CodeInput };
