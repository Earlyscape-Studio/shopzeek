"use client"


import { useState } from 'react'
import Image from "next/image"


interface Props{
    images: string[]
    name: string
}

export function ProductGallery({images, name}: Props) {
    const [active, setActive] = useState(0)


    return(
         <div className="space-y-3">
      <div className="relative h-96 bg-gray-50 rounded-2xl overflow-hidden">
        <Image
          src={images[active] ?? "/placeholder.png"}
          alt={name}
          fill
          className="object-contain p-6"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                active === i ? "border-orange-500" : "border-transparent"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
    )
}