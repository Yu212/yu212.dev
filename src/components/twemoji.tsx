import React from "react";
import twemoji from "@twemoji/api";
import Image from "next-export-optimize-images/image";

type TwemojiProps = {
  emoji: string;
  className?: string;
  size?: number;
  smSize?: number;
};

export default React.memo(function Emoji({ emoji, className = "", size = 20, smSize }: TwemojiProps) {
  const codePoint = twemoji.convert.toCodePoint(emoji);
  const src = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${codePoint}.svg`;

  if (smSize) {
    const wrapperClass = `inline-flex items-center ${className}`.trim();
    return (
      <span className={wrapperClass}>
        <Image className="inline md:hidden" src={src} width={smSize} height={smSize} alt={emoji} draggable={false}/>
        <Image className="hidden md:inline" src={src} width={size} height={size} alt={emoji} draggable={false}/>
      </span>
    );
  } else {
    return (
      <Image className={`inline ${className}`} src={src} width={size} height={size} alt={emoji} draggable={false}/>
    );
  }
});
