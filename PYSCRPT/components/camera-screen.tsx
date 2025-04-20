"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, RefreshCw, AlertCircle, Video } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CameraScreenProps {
  onPhotosCaptured: (photos: string[]) => void
}

type FilterType = "none" | "grayscale" | "vintage" | "retro"

export default function CameraScreen({ onPhotosCaptured }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recordingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [currentFilter, setCurrentFilter] = useState<FilterType>("none")
  const [showFlash, setShowFlash] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const captureCountRef = useRef(0)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const frameImagesRef = useRef<string[]>([])
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [frameByFrameUrl, setFrameByFrameUrl] = useState<string | null>(null)

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        // Stop any existing stream first
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        // Request camera with specific constraints for better performance
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        })

        setStream(mediaStream)
        setError(null)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((e) => {
              console.error("Error playing video:", e)
              setError("Could not play video stream. Please refresh the page.")
            })
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setError("Could not access camera. Please check permissions and try again.")
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Apply filter to canvas
  const applyFilter = useCallback(
    (context: CanvasRenderingContext2D, width: number, height: number) => {
      if (currentFilter === "none") return

      const imageData = context.getImageData(0, 0, width, height)
      const data = imageData.data

      switch (currentFilter) {
        case "grayscale":
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
            data[i] = data[i + 1] = data[i + 2] = gray
          }
          break

        case "vintage":
          // Warm tones, softened contrast, subtle grain, yellow/brown tint
          for (let i = 0; i < data.length; i += 4) {
            // Add warm yellow/brown tint
            data[i] = Math.min(255, data[i] * 1.1) // Increase red
            data[i + 1] = Math.min(255, data[i + 1] * 1.05) // Slightly increase green
            data[i + 2] = Math.max(0, data[i + 2] * 0.8) // Decrease blue

            // Soften contrast
            data[i] = 40 + data[i] * 0.8
            data[i + 1] = 40 + data[i + 1] * 0.8
            data[i + 2] = 40 + data[i + 2] * 0.8

            // Add subtle grain
            if (Math.random() > 0.97) {
              const grain = Math.random() * 20 - 10
              data[i] = Math.max(0, Math.min(255, data[i] + grain))
              data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain))
              data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain))
            }
          }
          break

        case "retro":
          // 10-bit retro effect (more colors than 8-bit but still pixelated)
          // First, reduce color depth to simulate 10-bit
          const colorDepth = 16 // Fewer colors for 10-bit look (more than 8-bit which would be 32)

          for (let i = 0; i < data.length; i += 4) {
            // Reduce color depth
            data[i] = Math.floor(data[i] / colorDepth) * colorDepth
            data[i + 1] = Math.floor(data[i + 1] / colorDepth) * colorDepth
            data[i + 2] = Math.floor(data[i + 2] / colorDepth) * colorDepth

            // Apply high contrast and color adjustments (keep the color grading)
            data[i] = Math.max(0, Math.min(255, (data[i] - 128) * 1.5 + 128)) // Red
            data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * 1.5 + 128)) // Green
            data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * 1.5 + 128)) // Blue
          }

          // Now pixelate the image for retro look
          const pixelSize = 4 // Size of each "pixel" block (smaller than 8-bit for more detail)
          const tempCanvas = document.createElement("canvas")
          const tempContext = tempCanvas.getContext("2d")

          if (tempContext) {
            tempCanvas.width = width
            tempCanvas.height = height

            // Draw the current image data to the temp canvas
            tempContext.putImageData(imageData, 0, 0)

            // Clear the original canvas
            context.clearRect(0, 0, width, height)

            // Draw pixelated version
            for (let y = 0; y < height; y += pixelSize) {
              for (let x = 0; x < width; x += pixelSize) {
                // Get the color of the first pixel in the block
                const pixelData = tempContext.getImageData(x, y, 1, 1).data

                // Fill a rectangle with that color
                context.fillStyle = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`
                context.fillRect(x, y, pixelSize, pixelSize)
              }
            }

            return // Skip the default putImageData since we've already drawn to the canvas
          }
          break
      }

      context.putImageData(imageData, 0, 0)
    },
    [currentFilter],
  )

  // Draw video frame to canvas with filter
  const drawVideoFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d", { alpha: false })

      if (context && video.readyState >= 2) {
        // Match canvas size to video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }

        // Draw the video frame - fix inversion by NOT flipping horizontally
        context.save()
        // Explicitly draw without flipping to fix inversion
        context.scale(-1, 1)
        context.translate(-canvas.width, 0)
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        context.restore()

        // Apply the selected filter
        applyFilter(context, canvas.width, canvas.height)

        // If recording frames, capture this frame
        if (isRecording) {
          captureFrame()
        }
      }
    }
  }, [applyFilter, isRecording])

  // Capture a frame for the recording
  const captureFrame = useCallback(() => {
    if (canvasRef.current && recordingCanvasRef.current) {
      const canvas = canvasRef.current
      const recordingCanvas = recordingCanvasRef.current
      const context = recordingCanvas.getContext("2d")

      if (context) {
        // Match recording canvas size to main canvas
        if (recordingCanvas.width !== canvas.width || recordingCanvas.height !== canvas.height) {
          recordingCanvas.width = canvas.width
          recordingCanvas.height = canvas.height
        }

        // Draw the current frame to the recording canvas
        context.drawImage(canvas, 0, 0)

        // Store the frame as an image
        const frameImage = recordingCanvas.toDataURL("image/jpeg", 0.7)
        frameImagesRef.current.push(frameImage)
      }
    }
  }, [])

  // Update canvas with video frame and filter
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return

    let animationFrameId: number

    const updateCanvas = () => {
      drawVideoFrame()
      animationFrameId = requestAnimationFrame(updateCanvas)
    }

    animationFrameId = requestAnimationFrame(updateCanvas)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [drawVideoFrame])

  // Start/stop recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }

      // Create a downloadable link for the frames
      if (frameImagesRef.current.length > 0) {
        // Create a zip file or just provide the frames
        const framesData = JSON.stringify(frameImagesRef.current)
        const blob = new Blob([framesData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        setFrameByFrameUrl(url)
      }
    } else {
      // Start recording
      setIsRecording(true)
      frameImagesRef.current = []

      if (canvasRef.current && stream) {
        try {
          // Create a media recorder from the canvas stream
          const canvasStream = canvasRef.current.captureStream(30) // 30 FPS
          const mediaRecorder = new MediaRecorder(canvasStream, { mimeType: "video/webm" })

          mediaRecorderRef.current = mediaRecorder
          recordedChunksRef.current = []

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data)
            }
          }

          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
            const url = URL.createObjectURL(blob)
            setRecordingUrl(url)
          }

          mediaRecorder.start()
        } catch (error) {
          console.error("Error starting recording:", error)
          setIsRecording(false)
        }
      }
    }
  }, [isRecording, stream])

  // Capture photo with current filter
  const capturePhoto = useCallback(() => {
    if (canvasRef.current) {
      // Show flash effect
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 300)

      // Get the canvas data URL
      const photoData = canvasRef.current.toDataURL("image/jpeg")

      // Update captured photos
      setCapturedPhotos((prev) => {
        const newPhotos = [...prev, photoData]
        captureCountRef.current += 1

        // If we've captured 8 photos, move to the next step
        if (captureCountRef.current >= 8) {
          setTimeout(() => {
            onPhotosCaptured(newPhotos)
          }, 500)
        }

        return newPhotos
      })
    }
  }, [onPhotosCaptured])

  // Start capture sequence
  const startCapture = useCallback(() => {
    // Reset capture count and photos if starting over
    if (!isCapturing) {
      setCapturedPhotos([])
      captureCountRef.current = 0
    }

    setIsCapturing(true)
    setCountdown(3)

    // Create a recursive function to handle the capture sequence
    const captureSequence = (photoNumber: number) => {
      // Start countdown
      let count = 3
      setCountdown(count)

      const countdownInterval = setInterval(() => {
        count -= 1
        setCountdown(count)

        if (count <= 0) {
          clearInterval(countdownInterval)

          // Capture the photo
          capturePhoto()

          // If we haven't captured all 8 photos, schedule the next capture
          if (photoNumber < 7) {
            setTimeout(() => {
              captureSequence(photoNumber + 1)
            }, 1000)
          } else {
            // We're done capturing
            setIsCapturing(false)
          }
        }
      }, 1000)
    }

    // Start the capture sequence with the first photo
    captureSequence(0)
  }, [isCapturing, capturePhoto])

  // Download recording
  const downloadRecording = useCallback(() => {
    if (recordingUrl) {
      const link = document.createElement("a")
      link.href = recordingUrl
      link.download = "photo-booth-recording.webm"
      link.click()
    }
  }, [recordingUrl])

  // Download frame-by-frame process
  const downloadFrameByFrame = useCallback(() => {
    if (frameByFrameUrl) {
      const link = document.createElement("a")
      link.href = frameByFrameUrl
      link.download = "photo-booth-frames.json"
      link.click()
    }
  }, [frameByFrameUrl])

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Take Your Photos</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative w-full mb-4">
        {/* Video element (hidden but used as source) */}
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />

        {/* Canvas for displaying video with filter */}
        <div className="relative">
          <canvas ref={canvasRef} className="w-full h-auto rounded-none border-2 border-[#FDF502]" />
          <canvas ref={recordingCanvasRef} className="hidden" />

          {/* Countdown overlay */}
          {isCapturing && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-[#FDF502] text-8xl font-bold">
              {countdown}
            </div>
          )}

          {/* Flash effect */}
          {showFlash && <div className="absolute inset-0 bg-white animate-flash"></div>}
        </div>

        {/* Filter selection */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex-1">
            <Select
              value={currentFilter}
              onValueChange={(value) => setCurrentFilter(value as FilterType)}
              disabled={isCapturing}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Filter</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
                <SelectItem value="vintage">Vintage (Warm, Faded)</SelectItem>
                <SelectItem value="retro">Retro (10-bit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-4 flex gap-2">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className={isRecording ? "bg-red-500" : "border-[#FDF502] text-[#FDF502]"}
            >
              <Video className="mr-2 h-4 w-4" />
              {isRecording ? "Stop Recording" : "Record Process"}
            </Button>

            <Button
              onClick={startCapture}
              disabled={isCapturing || !stream}
              size="lg"
              className="bg-[#FDF502] text-[#00005A] hover:bg-yellow-300"
            >
              {capturedPhotos.length > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake Photos ({capturedPhotos.length}/8)
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photos
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-2 text-center text-sm text-[#00005A]">
          {isCapturing ? (
            <p>Stay still or move as you like! Capturing {capturedPhotos.length + 1} of 8 photos...</p>
          ) : (
            <p>Click "Capture Photos" to take 8 photos with 3-second intervals</p>
          )}
        </div>

        {/* Download options */}
        <div className="mt-2 flex justify-center gap-2">
          {recordingUrl && (
            <Button onClick={downloadRecording} variant="outline" size="sm" className="border-[#FDF502] text-[#00005A]">
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
          )}

          {frameByFrameUrl && (
            <Button
              onClick={downloadFrameByFrame}
              variant="outline"
              size="sm"
              className="border-[#FDF502] text-[#00005A]"
            >
              <FilmIcon className="mr-2 h-4 w-4" />
              Download Frame-by-Frame
            </Button>
          )}
        </div>
      </div>

      {/* Thumbnail preview of captured photos */}
      {capturedPhotos.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Captured Photos: {capturedPhotos.length}/8</h3>
          <div className="grid grid-cols-4 gap-2">
            {capturedPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo || "/placeholder.svg"}
                alt={`Captured photo ${index + 1}`}
                className="w-full h-auto rounded-none border border-[#FDF502]"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Add the Download icon
function Download(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

// Add the Film icon for frame-by-frame download
function FilmIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  )
}
