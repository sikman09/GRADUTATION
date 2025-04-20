"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RefreshCw, ArrowRight } from "lucide-react"

interface PhotoSelectionProps {
  photos: string[]
  onPhotosSelected: (photos: string[]) => void
  onRetake: () => void
}

export default function PhotoSelection({ photos, onPhotosSelected, onRetake }: PhotoSelectionProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  const togglePhotoSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index))
    } else {
      if (selectedIndices.length < 4) {
        setSelectedIndices([...selectedIndices, index])
      }
    }
  }

  const handleContinue = () => {
    if (selectedIndices.length === 4) {
      const selectedPhotos = selectedIndices.map((index) => photos[index])
      onPhotosSelected(selectedPhotos)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Select 4 Photos</h2>
      <p className="text-[#FDF502] mb-6">Choose your favorite 4 photos to include in your photo strip.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-6">
        {photos.map((photo, index) => (
          <div key={index} className="relative">
            <div
              className={`relative border-2 rounded-none overflow-hidden cursor-pointer transition-all
                ${
                  selectedIndices.includes(index)
                    ? "border-[#FDF502] ring-2 ring-[#FDF502] ring-opacity-50"
                    : "border-[#00005A] hover:border-[#FDF502]"
                }`}
              onClick={() => togglePhotoSelection(index)}
            >
              <img
                src={photo || "/placeholder.svg"}
                alt={`Photo ${index + 1}`}
                className="w-full h-auto object-contain"
              />
              <div className="absolute top-2 right-2">
                <Checkbox
                  checked={selectedIndices.includes(index)}
                  onCheckedChange={() => togglePhotoSelection(index)}
                  className="h-5 w-5 bg-[#00005A] border-[#FDF502] text-[#FDF502]"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-[#00005A] bg-opacity-80 text-[#FDF502] text-center py-1">
                Photo {index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between w-full">
        <Button variant="outline" onClick={onRetake} className="border-[#FDF502] text-[#FDF502] hover:bg-[#00005A]">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retake Photos
        </Button>

        <Button
          onClick={handleContinue}
          disabled={selectedIndices.length !== 4}
          className="bg-[#FDF502] text-[#00005A] hover:bg-yellow-300 disabled:bg-[#00005A] disabled:text-[#FDF502]"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-[#FDF502]">{selectedIndices.length}/4 photos selected</p>
      </div>
    </div>
  )
}
