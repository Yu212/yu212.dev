"use client";

import { useEffect, useRef } from "react";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";

type WriteupContentProps = {
  html: string;
  className?: string;
};

const copyIconHtml = icon(faCopy).html.join("");
const checkIconHtml = icon(faCheck).html.join("");
const resetDelayMs = 1200;

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

export default function WriteupContent({ html, className }: WriteupContentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const onClick = async (event: MouseEvent) => {
      const target = event.target as Element | null;
      const button = target?.closest<HTMLButtonElement>("button.writeup-code-copy");
      if (!button) {
        return;
      }

      const wrapper = button.closest<HTMLElement>(".writeup-code-block");
      const pre = wrapper?.querySelector<HTMLPreElement>("pre");
      if (!pre) {
        return;
      }

      await copyToClipboard(pre.innerText);
      button.innerHTML = checkIconHtml;
      window.setTimeout(() => {
        button.innerHTML = copyIconHtml;
      }, resetDelayMs);
    };

    container.addEventListener("click", onClick);
    return () => {
      container.removeEventListener("click", onClick);
    };
  }, [html]);

  return (
    <div ref={containerRef} className={className ? `writeup ${className}` : "writeup"} dangerouslySetInnerHTML={{ __html: html }}/>
  );
}
