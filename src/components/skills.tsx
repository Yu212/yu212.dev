import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCode, faStar} from "@fortawesome/free-solid-svg-icons";
import {faStar as faStarStroke} from "@fortawesome/free-regular-svg-icons";
import Twemoji from "@/components/twemoji";
import Image from "next-export-optimize-images/image";
import React from "react";
import Section from "@/components/section";

function Skill({ icon, star, name }: { icon: string, star: number, name: string }) {
  return (
    <div className="contents">
      <Twemoji emoji={icon} className="mx-3" size={28} smSize={24}/>
      <span className="col-span-2 md:text-xl">
        {Array.from({ length: 5 }, (_, index) => (
          <FontAwesomeIcon key={index} icon={index < star ? faStar : faStarStroke} size="sm"/>
        ))}
        <span className="ml-3">{name}</span>
      </span>
    </div>
  )
}

export default function Skills() {
  return (
    <Section id="skills" icon={faCode} title="Skills">
      <div className="mt-6 text-lg md:text-xl text-left items-center grid grid-cols-[max-content_min-content_max-content] gap-y-1 leading-tight md:leading-snug">
        <Skill icon="📊" star={5} name="Competitive Programming"/>
        <div className="contents">
          <div></div>
          <span className="mr-2 md:text-lg md:leading-snug">AtCoder/Algo:</span>
          <div className="flex items-baseline gap-1 md:leading-snug">
            <Image className="w-6 h-6" src="/images/atcoder/user-orange-1.png" alt="Rating Icon" width={77} height={100}/>
            <span className="text-[#ff8000] md:text-xl">2462</span>
          </div>
        </div>
        <div className="contents">
          <div></div>
          <span className="mr-2 md:text-lg leading-snug">AtCoder/Heur:</span>
          <div className="flex items-baseline gap-1 md:leading-snug">
            <Image className="w-6 h-6" src="/images/atcoder/user-yellow-4.png" alt="Rating Icon" width={77} height={100}/>
            <span className="text-[#C0C000] md:text-xl">2308</span>
          </div>
        </div>
        <Skill icon="🚩" star={5} name="CTF"/>
        <Skill icon="☕" star={4} name="Java"/>
        <Skill icon="🐍" star={4} name="Python"/>
        <Skill icon="⚙" star={3} name="C++"/>
        <Skill icon="🦀" star={3} name="Rust"/>
      </div>
    </Section>
  )
}
