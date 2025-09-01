import { useState } from "react";

/**
 * Copies text to clipboard using native browser API
 * @param text - text to copy
 * @returns Promise<boolean> - true if copy was successful, false otherwise
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Check if Clipboard API is supported
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or insecure context
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
};

/**
 * Hook for copying text with state management
 * @returns object with copy function and state
 */
export const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setIsCopied(true);
      // Reset state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    }
    return success;
  };

  return { copy, isCopied };
};
