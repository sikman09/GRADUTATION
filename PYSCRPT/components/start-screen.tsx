"use client"

import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 text-center">
      <h1 className="text-4xl font-bold text-[#FDF502]">Digital Photo Booth</h1>
      <p className="text-xl max-w-md text-[#FDF502]">
        Take 8 photos, choose your favorites, and create a custom photo strip!
      </p>
      <Button onClick={onStart} size="lg" className="mt-4 bg-[#FDF502] text-[#00005A] hover:bg-yellow-300">
        <Camera className="mr-2 h-5 w-5" />
        Start Photo Booth
      </Button>
    </div>
  )
}
