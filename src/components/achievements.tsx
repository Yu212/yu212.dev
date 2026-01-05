import {faTrophy} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Twemoji from "@/components/twemoji";
import achievements from "@/assets/achievements.json"
import Section from "@/components/section";

type Achievement = {
  icon: string
  date: string
  text: string
  team_name?: string
  num_members?: number
  additional_member?: boolean
}

export default function Achievements() {
  return (
    <Section id="achievements" icon={faTrophy} title="Achievements">
      <div className="mt-6 mx-4 w-full text-lg text-left space-y-6 px-4">
        <div className="grid md:grid-cols-[max-content_1fr] gap-1 rounded-xl bg-white shadow-md py-6 px-3 md:px-6">
          {(achievements as Achievement[]).map((achievement, index) => (
            <div key={index} className="md:contents">
              <div className="flex justify-left">
                <div className="mx-2 w-[20px] ">
                  <Twemoji emoji={achievement.icon} className="w-[20px]"/>
                </div>
                <div className="mx-2">{achievement.date}</div>
              </div>
              <div className="mx-2">
                {achievement.text}
                {achievement.num_members &&
                  <div className="inline ml-1 bg-gray-200 shadow rounded text-xs px-0.5 cursor-default whitespace-nowrap" title={`${achievement.team_name} / ${achievement.num_members} 人チーム`}>
                    <Twemoji emoji="🤝" size={12}/><span className="mx-0.5">{achievement.num_members}{achievement.additional_member && "+"}</span>
                  </div>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
