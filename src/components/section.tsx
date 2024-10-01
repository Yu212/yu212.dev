import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-common-types";

export default function Section({ id, icon, title, children }: { id: string, icon: IconDefinition, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="py-16 text-center flex flex-col items-center">
      <h2 className="text-3xl">
        <FontAwesomeIcon icon={icon} className="mr-2"/>
        {title}
      </h2>
      {children}
    </section>
  )
}
