import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPuzzlePiece, faStar} from "@fortawesome/free-solid-svg-icons";
import {faStar as faStarStroke} from "@fortawesome/free-regular-svg-icons";
import Twemoji from "@/components/twemoji";
import React from "react";
import Section from "@/components/section";
import myChallenges from "@/assets/my-challenges.json"

type Challenge = {
  title: string
  categories: string[]
  difficulty: number
  url: string
}

type Contest = {
  contest: string
  url: string
  challenges: Challenge[]
}

const categoryEmoji: Record<string, string> = {
  crypto: "🔐",
  web: "🌐",
  pwn: "💣",
  reversing: "🔁",
  misc: "🎲",
  competitive_programming: "📊",
};

function Difficulty({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1 text-[#f5c518]" aria-label={`Difficulty ${level}`}>
      {Array.from({ length: 10 }, (_, index) => (
        <FontAwesomeIcon key={index} icon={index < level ? faStar : faStarStroke} size="xs" className={index < level ? "" : "text-gray-300"}/>
      ))}
      <span className="ml-1 text-xs text-gray-500">Lv.{level}</span>
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <li>
      <a className="block rounded-lg border bg-white shadow-sm p-3 hover:-translate-y-0.5 transition hover:shadow-md" href={challenge.url} target="_blank" rel="noopener noreferrer">
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-black">{challenge.title}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {challenge.categories.map((category) => (
            <span key={category} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
              <Twemoji emoji={categoryEmoji[category] ?? "🏷️"} size={14}/>
              <span className="capitalize">{category.replaceAll("_", " ")}</span>
            </span>
          ))}
          <div className="ml-auto">
            <Difficulty level={challenge.difficulty}/>
          </div>
        </div>
      </a>
    </li>
  )
}

export default function MyChallenges() {
  return (
    <Section id="my-challenges" icon={faPuzzlePiece} title="My Challenges">
      <div className="mt-6 mx-4 w-full text-left space-y-6 px-4">
        {(myChallenges as Contest[]).map((contest, index) => (
          <div key={index} className="rounded-xl bg-white shadow-md p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-xl font-semibold">
                {contest.url ? (
                  <a className="text-black hover:underline" href={contest.url} target="_blank" rel="noopener noreferrer">
                    {contest.contest}
                  </a>
                ) : (
                  contest.contest
                )}
              </h3>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {contest.challenges.map((challenge, idx) => (
                <ChallengeCard key={idx} challenge={challenge}/>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
