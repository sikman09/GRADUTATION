"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, ImageIcon, Type, Palette } from "lucide-react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CustomizationScreenProps {
  templateIndex: number
  selectedPhotos: string[]
  initialCustomizations: any
  onCustomizationComplete: (customizations: any) => void
  onBack: () => void
}

const BACKGROUND_COLORS = [
  // Original template colors
  {
    name: "Film Strip",
    value:
      "bg-gradient-to-b from-gray-800 to-gray-900 bg-[url('/placeholder.svg?height=400&width=200')] bg-opacity-20 bg-blend-overlay",
  },
  { name: "Light Brown", value: "bg-amber-200" }, // Fixed to be more brown than yellow
  { name: "Light Pink", value: "bg-pink-100" },
  { name: "Light Blue", value: "bg-blue-100" },
  // Additional pastel colors
  { name: "Pastel Green", value: "bg-green-100" },
  { name: "Pastel Orange", value: "bg-orange-100" },
  { name: "Pastel Purple", value: "bg-purple-100" },
  { name: "Pastel Teal", value: "bg-teal-100" },
  // Add brand colors
  { name: "Brand Yellow", value: "bg-[#FDF502]" },
  { name: "Brand Blue", value: "bg-[#00005A]" },
]

const TEXT_COLORS = [
  { name: "White", value: "text-white" },
  { name: "Black", value: "text-black" },
  { name: "Dark Blue", value: "text-blue-900" },
  { name: "Dark Brown", value: "text-amber-900" },
  { name: "Dark Pink", value: "text-pink-900" },
  { name: "Dark Green", value: "text-green-900" },
  { name: "Dark Orange", value: "text-orange-900" },
  { name: "Dark Purple", value: "text-purple-900" },
  { name: "Yellow", value: "text-[#FDF502]" },
  { name: "Blue", value: "text-[#00005A]" },
  { name: "Red", value: "text-red-500" },
  { name: "Green", value: "text-green-500" },
]

const FONTS = [
  { name: "Baskerville Old Face", value: "font-serif" },
  { name: "Arial", value: "font-sans" },
  { name: "Courier", value: "font-mono" },
  { name: "Georgia", value: "font-georgia" },
  { name: "Times New Roman", value: "font-times" },
]

// Expanded emoji stickers collection
const STICKERS = [
  // Celebration
  "🎓",
  "🎉",
  "🎊",
  "🎈",
  "🎆",
  "🎇",
  "✨",
  "⭐",
  "🌟",
  "💫",
  "💥",
  "🏆",
  "🥇",
  "🎯",
  "🎭",
  "🎨",
  // Faces
  "😀",
  "😁",
  "😂",
  "🥳",
  "😎",
  "🥰",
  "😍",
  "🤩",
  "😇",
  "🤗",
  "👍",
  "👏",
  // Objects
  "📚",
  "🎒",
  "📝",
  "🖋️",
  "📷",
  "🎬",
  "🎵",
  "🎸",
  "🎹",
  "🎺",
  "🎮",
  "🎲",
  // Nature
  "🌈",
  "🌺",
  "🌸",
  "🌼",
  "🌻",
  "🌹",
  "🍀",
  "🌴",
  "🌵",
  "🌲",
  "🍁",
  "🍂",
  // Food
  "🍕",
  "🍔",
  "🍦",
  "🍩",
  "🍰",
  "🎂",
  "🍫",
  "🍭",
  "🍿",
  "🥤",
  "🧁",
  "🍪",
  // Hearts
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "🤍",
  "🤎",
  "💖",
  "💗",
  "💓",
]

export default function CustomizationScreen({
  templateIndex,
  selectedPhotos,
  initialCustomizations,
  onCustomizationComplete,
  onBack,
}: CustomizationScreenProps) {
  // Set initial background color based on template index
  const getInitialBackgroundColor = () => {
    switch (templateIndex) {
      case 0:
        return BACKGROUND_COLORS[0].value // Film Strip
      case 1:
        return BACKGROUND_COLORS[1].value // Light Brown
      case 2:
        return BACKGROUND_COLORS[2].value // Light Pink
      case 3:
        return BACKGROUND_COLORS[3].value // Light Blue
      default:
        return BACKGROUND_COLORS[0].value
    }
  }

  // Set initial text color based on template index
  const getInitialTextColor = () => {
    // For all templates, we'll use white text as specified
    return "text-white"
  }

  const [customizations, setCustomizations] = useState({
    ...initialCustomizations,
    backgroundColor: getInitialBackgroundColor(),
    textColor: getInitialTextColor(),
  })

  const [stickers, setStickers] = useState<{ id: number; emoji: string; x: number; y: number; scale: number }[]>([])
  const [activeTab, setActiveTab] = useState("background")
  const [draggedSticker, setDraggedSticker] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Font customization - allow different fonts for each line
  const [fontCustomization, setFontCustomization] = useState({
    line1Font: "font-serif", // Baskerville Old Face
    line2Font: "font-serif",
    line3Font: "font-serif",
  })

  const handleTextChange = (field: string, value: string) => {
    setCustomizations({
      ...customizations,
      text: {
        ...customizations.text,
        [field]: value,
      },
    })
  }

  const handleFontChange = (line: string, font: string) => {
    setFontCustomization({
      ...fontCustomization,
      [line]: font,
    })
  }

  const handleAddSticker = (emoji: string) => {
    setStickers([
      ...stickers,
      {
        id: Date.now(),
        emoji,
        x: 50, // Center of preview
        y: 50, // Center of preview
        scale: 1,
      },
    ])
  }

  // Handle mouse down on sticker to start dragging
  const handleStickerMouseDown = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    setDraggedSticker(id)
  }

  // Handle mouse move to update sticker position
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedSticker === null || !previewRef.current) return

    const rect = previewRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Ensure sticker stays within bounds
    const boundedX = Math.max(5, Math.min(95, x))
    const boundedY = Math.max(5, Math.min(95, y))

    setStickers(
      stickers.map((sticker) => (sticker.id === draggedSticker ? { ...sticker, x: boundedX, y: boundedY } : sticker)),
    )
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDraggedSticker(null)
  }

  // Add event listeners for mouse up outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggedSticker(null)
    }

    if (draggedSticker !== null) {
      window.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [draggedSticker])

  const handleContinue = () => {
    onCustomizationComplete({
      ...customizations,
      stickers,
      fontCustomization,
    })
  }

  return (
    <div className="flex flex-col w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Customize Your Photo Strip</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Preview */}
        <div className="w-full md:w-1/2">
          <div
            ref={previewRef}
            className={`${customizations.backgroundColor} rounded-none p-4 w-full relative`}
            style={{ width: "2in", height: "7in", margin: "0 auto" }}
            onMouseMove={draggedSticker !== null ? handleMouseMove : undefined}
            onMouseUp={draggedSticker !== null ? handleMouseUp : undefined}
          >
            <div className="h-full flex flex-col">
              {/* Date */}
              <div className={`text-center mb-2 ${customizations.textColor}`}>{format(new Date(), "MMMM d, yyyy")}</div>

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
              <div className={`text-center ${customizations.textColor}`}>
                <p className={`font-bold ${fontCustomization.line1Font} text-sm`}>{customizations.text.line1}</p>
                <p className={`underline ${fontCustomization.line2Font} text-sm`}>{customizations.text.line2}</p>
                <p className={`font-bold ${fontCustomization.line3Font} text-base`}>{customizations.text.line3}</p>
              </div>

              {/* Stickers */}
              {stickers.map((sticker) => (
                <div
                  key={sticker.id}
                  className={`absolute text-2xl cursor-move ${
                    draggedSticker === sticker.id ? "z-50 opacity-90" : "z-10"
                  }`}
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                    fontSize: "2rem",
                    userSelect: "none",
                  }}
                  onMouseDown={(e) => handleStickerMouseDown(e, sticker.id)}
                >
                  {sticker.emoji}
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs mt-2 text-[#00005A]">Preview: 2in × 7in (Drag stickers to position them)</p>
        </div>

        {/* Customization Options */}
        <div className="w-full md:w-1/2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="background">
                <Palette className="h-4 w-4 mr-2" />
                Background
              </TabsTrigger>
              <TabsTrigger value="text">
                <Type className="h-4 w-4 mr-2" />
                Text
              </TabsTrigger>
              <TabsTrigger value="stickers">
                <ImageIcon className="h-4 w-4 mr-2" />
                Stickers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="background" className="space-y-4">
              <div>
                <Label>Background Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {BACKGROUND_COLORS.map((color) => (
                    <div
                      key={color.value}
                      className={`${color.value} h-10 rounded-none cursor-pointer border-2 ${
                        customizations.backgroundColor === color.value ? "border-[#FDF502]" : "border-transparent"
                      }`}
                      onClick={() =>
                        setCustomizations({
                          ...customizations,
                          backgroundColor: color.value,
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Text Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {TEXT_COLORS.map((color) => (
                    <div
                      key={color.value}
                      className={`bg-[#00005A] h-10 rounded-none cursor-pointer border-2 ${
                        customizations.textColor === color.value ? "border-[#FDF502]" : "border-transparent"
                      }`}
                    >
                      <div
                        className={`${color.value} h-full flex items-center justify-center font-bold`}
                        onClick={() =>
                          setCustomizations({
                            ...customizations,
                            textColor: color.value,
                          })
                        }
                      >
                        Aa
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label>Line 1 (Bold)</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={customizations.text.line1}
                      onChange={(e) => handleTextChange("line1", e.target.value)}
                      placeholder="CONGRATULATIONS"
                      maxLength={20} // Limit text length to ensure it fits
                    />
                  </div>
                  <div className="w-1/3">
                    <Select
                      value={fontCustomization.line1Font}
                      onValueChange={(value) => handleFontChange("line1Font", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONTS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.value}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label>Line 2 (Underlined)</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={customizations.text.line2}
                      onChange={(e) => handleTextChange("line2", e.target.value)}
                      placeholder="CLASS 2025"
                      maxLength={20} // Limit text length to ensure it fits
                    />
                  </div>
                  <div className="w-1/3">
                    <Select
                      value={fontCustomization.line2Font}
                      onValueChange={(value) => handleFontChange("line2Font", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONTS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.value}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <Label>Line 3 (Larger Font)</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={customizations.text.line3}
                      onChange={(e) => handleTextChange("line3", e.target.value)}
                      placeholder="BATCH BANTÁYOG"
                      maxLength={20} // Limit text length to ensure it fits
                    />
                  </div>
                  <div className="w-1/3">
                    <Select
                      value={fontCustomization.line3Font}
                      onValueChange={(value) => handleFontChange("line3Font", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONTS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.value}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stickers" className="space-y-4">
              <Label>Add Stickers (Click to add, then drag to position)</Label>
              <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                {STICKERS.map((sticker) => (
                  <button
                    key={sticker}
                    className="text-2xl h-12 bg-[#00005A] hover:bg-blue-900 rounded-none"
                    onClick={() => handleAddSticker(sticker)}
                  >
                    {sticker}
                  </button>
                ))}
              </div>

              {stickers.length > 0 && (
                <div className="mt-4">
                  <Label>Current Stickers</Label>
                  <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                    {stickers.map((sticker) => (
                      <div key={sticker.id} className="text-2xl p-2 bg-[#00005A] rounded-none">
                        {sticker.emoji}
                        <button
                          className="ml-2 text-xs text-red-500"
                          onClick={() => setStickers(stickers.filter((s) => s.id !== sticker.id))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-[#00005A] mt-2">
                    Drag stickers in the preview to position them exactly where you want.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="border-[#FDF502] text-[#00005A] hover:bg-[#FDF502]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>

        <Button onClick={handleContinue} className="bg-[#FDF502] text-[#00005A] hover:bg-yellow-300">
          Preview Final Result
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
