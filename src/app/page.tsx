import React from "react";
import Works from "@/components/works";
import About from "@/components/about";
import Skills from "@/components/skills";
import Achievements from "@/components/achievements";

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full h-96 bg-[#95caee] flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl text-white font-bold">Yu_212&apos;s Portfolio</h1>
      </div>
      <nav className="sticky top-0 bg-white shadow-md z-10 w-full">
        <div className="mx-auto px-4 max-w-3xl flex">
          {["About", "Works", "Skills", "Achievements"].map((section, index) => (
            <a key={index} className="flex-1 text-center py-2 transition hover:text-[#6292e9]" href={`#${section.toLowerCase()}`}>
              {section}
            </a>
          ))}
        </div>
      </nav>
      <main className="flex-grow">
        <About/>
        <Works/>
        <Skills/>
        <Achievements/>
        <footer className="text-center py-8">
        <p>Last updated: {new Date("2024-10-02").toLocaleDateString("ja-JP")}</p>
        </footer>
      </main>
    </div>
  );
}
