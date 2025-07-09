"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square } from "lucide-react"
import { TouchButton } from "./TouchOptimized"
import { cn } from "@/lib/utils"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  className?: string
  language?: string
}

export function VoiceInput({ onTranscript, onError, className, language = "zh-CN" }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [audioLevel, setAudioLevel] = useState(0)

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number>()

  // 检查浏览器支持
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsRecording(true)
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript((prev) => prev + finalTranscript)
        setInterimTranscript(interimTranscript)

        if (finalTranscript) {
          onTranscript(finalTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        onError?.(event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        setInterimTranscript("")
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [language, onTranscript, onError])

  // 音频可视化
  const setupAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)

      microphoneRef.current.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(average / 255)
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()
    } catch (error) {
      console.error("Error setting up audio visualization:", error)
    }
  }, [isRecording])

  const startRecording = useCallback(async () => {
    if (!isSupported || !recognitionRef.current) {
      onError?.("语音识别不支持")
      return
    }

    try {
      await setupAudioVisualization()
      recognitionRef.current.start()

      // 触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    } catch (error) {
      console.error("Error starting recording:", error)
      onError?.("无法启动录音")
    }
  }, [isSupported, setupAudioVisualization, onError])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setAudioLevel(0)

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const clearTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
  }, [])

  if (!isSupported) {
    return (
      <div className={cn("p-4 bg-gray-800/50 rounded-lg border border-gray-700", className)}>
        <p className="text-center text-gray-400">您的浏览器不支持语音识别功能</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 录音控制 */}
      <div className="flex flex-col items-center space-y-4">
        {/* 音频可视化 */}
        <div className="relative">
          <motion.div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-colors",
              isRecording ? "bg-red-600 shadow-lg shadow-red-500/50" : "bg-blue-600 hover:bg-blue-700",
            )}
            animate={{
              scale: isRecording ? 1 + audioLevel * 0.3 : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            <TouchButton
              variant="primary"
              size="lg"
              onClick={toggleRecording}
              className="w-full h-full rounded-full bg-transparent hover:bg-transparent p-0"
            >
              {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
            </TouchButton>
          </motion.div>

          {/* 录音波纹效果 */}
          <AnimatePresence>
            {isRecording && (
              <>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-red-400"
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{
                      scale: 2 + i * 0.5,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* 状态文本 */}
        <div className="text-center">
          <p className="text-lg font-medium text-white">{isRecording ? "正在录音..." : "点击开始录音"}</p>
          <p className="text-sm text-gray-400">{isRecording ? "再次点击停止录音" : "支持中文语音识别"}</p>
        </div>
      </div>

      {/* 实时转录显示 */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">语音转录</h3>
              {transcript && (
                <TouchButton variant="secondary" size="sm" onClick={clearTranscript} className="text-xs">
                  清空
                </TouchButton>
              )}
            </div>

            <div className="space-y-2">
              {transcript && <p className="text-white">{transcript}</p>}
              {interimTranscript && <p className="text-gray-400 italic">{interimTranscript}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 使用提示 */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>• 请允许浏览器访问麦克风权限</p>
        <p>• 在安静环境中获得更好的识别效果</p>
        <p>• 支持连续语音识别</p>
      </div>
    </div>
  )
}
