"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { gallery } from "@/content/gallery";

export function GalleryGrid() {
  const [index, setIndex] = useState(-1);

  const slides = gallery.map((g) => ({
    src: g.image.src,
    alt: g.alt,
    title: g.caption,
    width: g.image.width,
    height: g.image.height,
  }));

  return (
    <>
      <div className="gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {gallery.map((g, i) => (
          <motion.button
            type="button"
            key={g.id}
            onClick={() => setIndex(i)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: "easeOut" }}
            aria-label={`Open image: ${g.alt}`}
            className="block w-full break-inside-avoid overflow-hidden rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Image
              src={g.image}
              alt={g.alt}
              placeholder="blur"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full transition-transform duration-500 hover:scale-[1.03]"
            />
          </motion.button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={slides}
        plugins={[Zoom, Thumbnails, Captions]}
        captions={{ descriptionTextAlign: "center" }}
      />
    </>
  );
}
