"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { format } from "date-fns"

interface TemplateSelectionProps {
  onTemplateSelected: (templateIndex: number) => void
  selectedPhotos: string[]
}

export default function TemplateSelection({ onTemplateSelected, selectedPhotos }: TemplateSelectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(0)

  const templates = [
    {
      name: "Film Strip",
      background:
        "bg-gradient-to-b from-gray-800 to-gray-900 bg-[url('/placeholder.svg?height=400&width=200')] bg-opacity-20 bg-blend-overlay",
      textColor: "text-white",
    },
    {
      name: "Light Brown",
      background: "bg-amber-200", // Fixed to be more brown than yellow
      textColor: "text-white",
    },
    {
      name: "Light Pink",
      background: "bg-pink-100",
      textColor: "text-white",
    },
    {
      name: "Light Blue",
      background: "bg-blue-100",
      textColor: "text-white",
    },
  ]

  const handleContinue = () => {
    onTemplateSelected(selectedTemplate)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Choose a Template</h2>
      <p className="text-[#00005A] mb-6">Select a template for your photo strip.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        {templates.map((template, index) => (
          <div
            key={index}
            className={`cursor-pointer transition-all ${
              selectedTemplate === index ? "ring-2 ring-[#FDF502]" : "hover:opacity-90"
            }`}
            onClick={() => setSelectedTemplate(index)}
          >
            <div className={`${template.background} rounded-none p-4 w-full`}>
              <div className="aspect-[2/7] flex flex-col">
                {/* Date */}
                <div
                  className={`text-center mb-2 ${
                    index === 0
                      ? "text-white"
                      : index === 1
                        ? "text-amber-800"
                        : index === 2
                          ? "text-pink-800"
                          : "text-blue-800"
                  }`}
                >
                  {format(new Date(), "MMMM d, yyyy")}
                </div>

                {/* Photos */}
                <div className="flex-1 grid grid-rows-4 gap-2 mb-4">
                  {selectedPhotos.map((photo, photoIndex) => (
                    <div key={photoIndex} className="w-full overflow-hidden rounded-none">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Selected photo ${photoIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>

                {/* Text */}
                <div
                  className={`text-center ${
                    index === 0
                      ? "text-white"
                      : index === 1
                        ? "text-amber-800"
                        : index === 2
                          ? "text-pink-800"
                          : "text-blue-800"
                  }`}
                >
                  <p className="font-bold text-sm">CONGRATULATIONS</p>
                  <p className="underline text-sm">CLASS 2025</p>
                  <p className="text-base font-bold">BATCH BANTÁYOG</p>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center font-medium">
              Template {index + 1}: {template.name}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end w-full">
        <Button onClick={handleContinue} className="bg-[#FDF502] text-[#00005A] hover:bg-yellow-300">
          Continue to Customize
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
