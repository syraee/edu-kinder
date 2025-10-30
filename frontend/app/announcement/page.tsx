"use client";

import { useState } from "react";

export default function GalleryPage() {
  const [albums] = useState([
    {
      id: 1,
      title: "Výlet do ZOO",
      date: "12. október 2025",
      photos: [
        "/gallery/zoo1.jpg",
        "/gallery/zoo2.jpg",
        "/gallery/zoo3.jpg",
      ],
    },
    {
      id: 2,
      title: "Deň detí v škôlke",
      date: "1. jún 2025",
      photos: [
        "/gallery/children1.jpg",
        "/gallery/children2.jpg",
        "/gallery/children3.jpg",
      ],
    },
  ]);

  return (
    <div className="govuk-width-container idsk-page-content">
      <h1 className="govuk-heading-xl idsk-heading-xl text-center mb-8">
        Fotogaléria
      </h1>

      {albums.map((album) => (
        <section
          key={album.id}
          className="govuk-section idsk-section bg-light p-6 mb-8 idsk-shadow-medium rounded-lg"
        >
          <header className="mb-4">
            <h2 className="govuk-heading-m idsk-heading-m text-primary mb-1">
              {album.title}
            </h2>
            <p className="govuk-body-s text-secondary">{album.date}</p>
          </header>

          <div className="govuk-grid-row idsk-gallery">
            {album.photos.map((src, idx) => (
              <div key={idx} className="govuk-grid-column-one-third p-2">
                <img
                  src={src}
                  alt={`${album.title} ${idx + 1}`}
                  className="idsk-shadow-small govuk-image w-full rounded-sm hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
