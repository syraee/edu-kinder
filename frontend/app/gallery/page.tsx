"use client";

import Link from "next/link";
import { useState } from "react";
import Header from '@/app/components/Header';
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
    <>
     <Header />
     <div className="govuk-width-container gallery-page">
      <h1 className="govuk-heading-xl text-center mb-8">Fotogaléria</h1>

      {albums.map((album) => (
        <section key={album.id} className="gallery-album">
          <div className="album-header">
            <h2 className="album-title">{album.title}</h2>
            <span className="album-date">{album.date}</span>
          </div>

          <div className="album-photos">
            {album.photos.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`${album.title} ${idx + 1}`}
                className="album-photo"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
    </>
  );
}
