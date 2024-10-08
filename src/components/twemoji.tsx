import React from "react";
import twemoji from "@twemoji/api";
import Image from "next-export-optimize-images/image";

export default React.memo(function Emoji({ emoji, className = "", size = 20 }: { emoji: string, className?: string, size?: number }) {
  const codePoint = twemoji.convert.toCodePoint(emoji);
  return (
    <Image className={`inline ${className}`} src={`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${codePoint}.svg`} width={size} height={size} alt={emoji} draggable={false}/>
  )
})
