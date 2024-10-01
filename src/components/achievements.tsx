import {faTrophy} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Twemoji from "@/components/twemoji";
import achievements from "@/assets/achievements.json"
import Section from "@/components/section";

export default function Achievements() {
  return (
    <Section id="achievements" icon={faTrophy} title="Achievements">
      <div className="mt-4 mx-4 text-lg text-left grid md:grid-cols-[max-content_1fr] gap-1">
        {achievements.map((achievement, index) => (
          <div key={index} className="md:contents">
            <div className="flex justify-left">
              <div className="mx-2 w-[20px] ">
                <Twemoji emoji={achievement.icon} className="w-[20px]"/>
              </div>
              <div className="mx-2">{achievement.date}</div>
            </div>
            <div className="mx-2">
              {achievement.text}
              {achievement.numTeams &&
                <span className="ml-1" title={`${achievement.numTeams} 人チーム`}>
                  <Twemoji emoji="🤝" size={16}/>
                </span>
              }
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
