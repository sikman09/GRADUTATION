"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Home } from "lucide-react"
import { format } from "date-fns"
import html2canvas from "html2canvas"

interface FinalPreviewProps {
  selectedPhotos: string[]
  templateIndex: number
  customizations: any
  onStartOver: () => void
  onBack: () => void
}

export default function FinalPreview({
  selectedPhotos,
  templateIndex,
  customizations,
  onStartOver,
  onBack,
}: FinalPreviewProps) {
  const photoStripRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!photoStripRef.current) return

    try {
      const canvas = await html2canvas(photoStripRef.current, {
        scale: 2, // Higher resolution
        useCORS: true, // To handle cross-origin images
        allowTaint: true,
        backgroundColor: null,
      })

      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `photo-strip-${format(new Date(), "yyyy-MM-dd")}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error generating image:", error)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Your Photo Strip</h2>
      <p className="text-[#00005A] mb-6">
        Here's your final photo strip! You can download it or go back to make changes.
      </p>

      <div className="mb-8 p-4 border border-[#FDF502] rounded-none">
        <div
          ref={photoStripRef}
          className={`${customizations.backgroundColor} rounded-none p-4 w-full max-w-md mx-auto`}
          style={{ width: "2in", height: "7in" }}
        >
          <div className="h-full flex flex-col relative">
            {/* Date */}
            <div className={`text-center mb-2 ${customizations.textColor} text-sm`}>
              {format(new Date(), "MMMM d, yyyy")}
            </div>

            {/* Photos */}
            <div className="flex-1 grid grid-rows-4 gap-2 mb-3">
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

            {/* Text with custom fonts - ensure text fits */}
            <div className={`text-center ${customizations.textColor}`}>
              <p className={`font-bold ${customizations.fontCustomization?.line1Font || "font-serif"} text-sm`}>
                {customizations.text.line1}
              </p>
              <p className={`underline ${customizations.fontCustomization?.line2Font || "font-serif"} text-sm`}>
                {customizations.text.line2}
              </p>
              <p className={`font-bold ${customizations.fontCustomization?.line3Font || "font-serif"} text-base`}>
                {customizations.text.line3}
              </p>
            </div>

            {/* Stickers */}
            {customizations.stickers &&
              customizations.stickers.map((sticker: any) => (
                <div
                  key={sticker.id}
                  className="absolute text-2xl"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                    fontSize: "1.5rem", // Slightly smaller to ensure they fit
                  }}
                >
                  {sticker.emoji}
                </div>
              ))}
          </div>
        </div>
        <p className="text-center text-xs mt-2 text-[#00005A]">Final size: 2in × 7in</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" onClick={onBack} className="border-[#FDF502] text-[#00005A] hover:bg-[#FDF502]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customize
        </Button>

        <Button onClick={handleDownload} className="bg-[#FDF502] text-[#00005A] hover:bg-yellow-300">
          <Download className="mr-2 h-4 w-4" />
          Download Photo Strip
        </Button>

        <Button onClick={onStartOver} variant="secondary">
          <Home className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
    </div>
  )
}
