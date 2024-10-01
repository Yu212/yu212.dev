"use client";

import React from "react";
import Image from "next/image";
import {faChevronUp, faChevronDown, faUpRightFromSquare, faProjectDiagram} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGithub} from "@fortawesome/free-brands-svg-icons";
import works from "@/assets/works.json"
import Section from "@/components/section";

export default function Works() {
  const [showAll, setShowAll] = React.useState(false);

  return (
    <Section id="works" icon={faProjectDiagram} title="Works">
      <div className={`mt-4 relative overflow-hidden ${!showAll && "max-h-[700px]"}`}>
        <div className="text-left grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {works.map((work, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow-md w-64 h-[280px]">
              <a className="relative" href={work.url} target="_blank" rel="noopener noreferrer">
                <Image width={work.thumbnail.width} height={work.thumbnail.height} src={work.thumbnail.src} alt={work.title} className="h-40 w-full object-cover"/>
                {work.url &&
                  <div className="absolute top-0 right-1">
                    <FontAwesomeIcon icon={faUpRightFromSquare} size="sm" color="white"/>
                  </div>
                }
              </a>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{work.title}</h3>
                  {work.github_url &&
                    <a className="rounded-full h-6 w-6 flex items-center justify-center transition hover:bg-gray-300" href={work.github_url} target="_blank" rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faGithub} size="lg"/>
                    </a>
                  }
                </div>
                <p className="text-sm mt-2 text-gray-600">{work.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 w-full">
          <button className="shadow-md outline-none text-white w-10 h-10 rounded-full transition bg-[#6292e9] hover:bg-[#95caee]" onClick={() => setShowAll(showAll => !showAll)}>
            <FontAwesomeIcon icon={showAll ? faChevronUp : faChevronDown} size="lg"/>
          </button>
          {!showAll &&
            <div className="h-8 bg-gradient-to-t from-gray-100 to-transparent"/>
          }
        </div>
      </div>
    </Section>
  )
}
