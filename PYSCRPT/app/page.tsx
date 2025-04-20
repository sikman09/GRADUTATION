"use client"

import { useState } from "react"
import CameraScreen from "@/components/camera-screen"
import PhotoSelection from "@/components/photo-selection"
import TemplateSelection from "@/components/template-selection"
import CustomizationScreen from "@/components/customization-screen"
import FinalPreview from "@/components/final-preview"
import StartScreen from "@/components/start-screen"

export default function Home() {
  const [currentStep, setCurrentStep] = useState<
    "start" | "camera" | "selection" | "template" | "customize" | "preview"
  >("start")
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0)
  const [customizations, setCustomizations] = useState({
    stickers: [],
    font: "font-serif", // Baskerville Old Face
    fontCustomization: {
      line1Font: "font-serif",
      line2Font: "font-serif",
      line3Font: "font-serif",
    },
    text: {
      line1: "CONGRATULATIONS",
      line2: "CLASS 2025",
      line3: "BATCH BANTÁYOG",
    },
    backgroundColor: "",
    textColor: "text-white",
  })

  const handlePhotoCaptured = (photos: string[]) => {
    setCapturedPhotos(photos)
    setCurrentStep("selection")
  }

  const handlePhotoSelection = (photos: string[]) => {
    setSelectedPhotos(photos)
    setCurrentStep("template")
  }

  const handleTemplateSelection = (templateIndex: number) => {
    setSelectedTemplate(templateIndex)
    setCurrentStep("customize")
  }

  const handleCustomizationComplete = (customizationData: any) => {
    setCustomizations(customizationData)
    setCurrentStep("preview")
  }

  const handleRetakePhotos = () => {
    setCapturedPhotos([])
    setSelectedPhotos([])
    setCurrentStep("camera")
  }

  const handleStartOver = () => {
    setCapturedPhotos([])
    setSelectedPhotos([])
    setSelectedTemplate(0)
    setCustomizations({
      stickers: [],
      font: "font-serif",
      fontCustomization: {
        line1Font: "font-serif",
        line2Font: "font-serif",
        line3Font: "font-serif",
      },
      text: {
        line1: "CONGRATULATIONS",
        line2: "CLASS 2025",
        line3: "BATCH BANTÁYOG",
      },
      backgroundColor: "",
      textColor: "text-white",
    })
    setCurrentStep("start")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      {currentStep === "start" && <StartScreen onStart={() => setCurrentStep("camera")} />}

      {currentStep === "camera" && <CameraScreen onPhotosCaptured={handlePhotoCaptured} />}

      {currentStep === "selection" && (
        <PhotoSelection photos={capturedPhotos} onPhotosSelected={handlePhotoSelection} onRetake={handleRetakePhotos} />
      )}

      {currentStep === "template" && (
        <TemplateSelection onTemplateSelected={handleTemplateSelection} selectedPhotos={selectedPhotos} />
      )}

      {currentStep === "customize" && (
        <CustomizationScreen
          templateIndex={selectedTemplate}
          selectedPhotos={selectedPhotos}
          initialCustomizations={customizations}
          onCustomizationComplete={handleCustomizationComplete}
          onBack={() => setCurrentStep("template")}
        />
      )}

      {currentStep === "preview" && (
        <FinalPreview
          selectedPhotos={selectedPhotos}
          templateIndex={selectedTemplate}
          customizations={customizations}
          onStartOver={handleStartOver}
          onBack={() => setCurrentStep("customize")}
        />
      )}
    </main>
  )
}
