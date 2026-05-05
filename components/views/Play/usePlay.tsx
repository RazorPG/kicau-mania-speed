"use client"
import { useEffect, useRef, useState } from "react"

type GameState = "IDLE" | "COUNTDOWN" | "PLAYING" | "GAME_OVER"

// ─────────────────────────────────────────────
// Konstanta
// ─────────────────────────────────────────────
const SWING_COOLDOWN = 350 // ms antar count (cukup pendek agar lambai cepat terhitung)
const MAX_FRAMES = 6 // dikurangi dari 10 agar responsif di lambai cepat
const SWING_THRESHOLD = 0.06 // amplitudo minimum (sedikit dikurangi agar lambai cepat tetap detect)
const MIN_FINGER_UP = 3

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const isFingerUp = (lm: any[], tip: number, base: number) =>
  lm[tip].y < lm[base].y

const isHandOpen = (lm: any[]) =>
  [
    isFingerUp(lm, 8, 6),
    isFingerUp(lm, 12, 10),
    isFingerUp(lm, 16, 14),
    isFingerUp(lm, 20, 18),
  ].filter(Boolean).length >= MIN_FINGER_UP

const isHandAtMouth = (lm: any[], wristOtherY: number) => {
  const isAboveOtherHand = lm[0].y < wristOtherY
  const isNotFullyOpen = !isHandOpen(lm)
  return isAboveOtherHand && isNotFullyOpen
}

/**
 * Deteksi ayunan dengan peak/valley dari 3 titik terakhir.
 * Lebih responsif dibanding window-average karena hanya butuh 3 frame,
 * sehingga lambai cepat maupun lambat sama-sama terdeteksi.
 *
 * Syarat dihitung sebagai ayunan:
 *   1. Titik tengah (hist[n-2]) adalah peak atau valley
 *   2. Amplitudo keseluruhan history >= SWING_THRESHOLD
 */
function detectSwing(hist: number[]): boolean {
  if (hist.length < 3) return false

  const amplitude = Math.max(...hist) - Math.min(...hist)
  if (amplitude < SWING_THRESHOLD) return false

  const n = hist.length
  const i = n - 2 // titik tengah dari 3 frame terakhir

  const isPeak = hist[i] > hist[i - 1] && hist[i] > hist[n - 1]
  const isValley = hist[i] < hist[i - 1] && hist[i] < hist[n - 1]

  return isPeak || isValley
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export default function usePlay() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handsRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)
  const isProcessingRef = useRef(false)
  const isInitializedRef = useRef(false)
  const lastCountTimeRef = useRef(0)

  // History x per hand index
  const historyRef = useRef<{ [idx: number]: number[] }>({})

  const [counter, setCounter] = useState(0)
  const [gameState, setGameState] = useState<GameState>("IDLE")
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(15)

  const gameStateRef = useRef<GameState>("IDLE")
  const updateGameState = (s: GameState) => {
    gameStateRef.current = s
    setGameState(s)
  }

  // ── Game controls ──────────────────────────
  const startGame = () => {
    setCounter(0)
    setCountdown(3)
    setTimeLeft(15)
    updateGameState("COUNTDOWN")
    audioRef.current?.play().catch(() => {})
  }

  const resetGame = () => {
    setCounter(0)
    updateGameState("IDLE")
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  // ── Countdown timer ────────────────────────
  useEffect(() => {
    if (gameState !== "COUNTDOWN") return
    const t = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(t)
          updateGameState("PLAYING")
          return 3
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [gameState])

  // ── Play timer ─────────────────────────────
  useEffect(() => {
    if (gameState !== "PLAYING") return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t)
          updateGameState("GAME_OVER")
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [gameState])

  // ── MediaPipe onResults ────────────────────
  const onResults = (results: any) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (results.image)
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

    const lms = results.multiHandLandmarks as any[] | undefined
    const hands = results.multiHandedness as any[] | undefined

    if (!lms || lms.length === 0) {
      ctx.restore()
      return
    }

    // Gambar skeleton
    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [5, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [9, 13],
      [13, 14],
      [14, 15],
      [15, 16],
      [13, 17],
      [17, 18],
      [18, 19],
      [19, 20],
      [0, 17],
    ]
    ctx.strokeStyle = "#00FF00"
    ctx.lineWidth = 3
    ctx.fillStyle = "#FF0000"
    lms.forEach(lm => {
      connections.forEach(([s, e]) => {
        ctx.beginPath()
        ctx.moveTo(lm[s].x * canvas.width, lm[s].y * canvas.height)
        ctx.lineTo(lm[e].x * canvas.width, lm[e].y * canvas.height)
        ctx.stroke()
      })
      lm.forEach((p: any) => {
        ctx.beginPath()
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    })
    ctx.restore()

    // Hapus history tangan yang sudah tidak terdeteksi
    if (hands) {
      const activeIdxs = new Set(hands.map((h: any) => h.index as number))
      Object.keys(historyRef.current).forEach(k => {
        if (!activeIdxs.has(Number(k))) delete historyRef.current[Number(k)]
      })
    }

    if (!hands || lms.length < 2) return // Butuh 2 tangan

    // Kumpulkan wrist Y kedua tangan
    const wristYMap: { [idx: number]: number } = {}
    lms.forEach((lm, i) => {
      const idx = hands[i].index as number
      wristYMap[idx] = lm[0].y
    })

    // Tentukan peran tiap tangan
    let mulutIdx: number | null = null
    let lambaiIdx: number | null = null

    lms.forEach((lm, i) => {
      const idx = hands[i].index as number
      const otherIdx = Object.keys(wristYMap)
        .map(Number)
        .find(k => k !== idx)
      if (otherIdx === undefined) return

      if (isHandAtMouth(lm, wristYMap[otherIdx])) mulutIdx = idx
      if (isHandOpen(lm)) lambaiIdx = idx
    })

    // Kedua kondisi harus terpenuhi oleh tangan yang berbeda
    if (mulutIdx === null || lambaiIdx === null) return
    if (mulutIdx === lambaiIdx) return

    // Update history tangan yang melambai
    const lambaiHandIdx = hands.findIndex((h: any) => h.index === lambaiIdx)
    if (lambaiHandIdx === -1) return
    const lambaiLm = lms[lambaiHandIdx]

    if (!historyRef.current[lambaiIdx!]) historyRef.current[lambaiIdx!] = []
    const hist = historyRef.current[lambaiIdx!]

    hist.push(lambaiLm[9].x)
    if (hist.length > MAX_FRAMES) hist.shift()

    // Deteksi ayunan — responsif untuk lambai cepat maupun lambat
    if (detectSwing(hist) && gameStateRef.current === "PLAYING") {
      const now = Date.now()
      if (now - lastCountTimeRef.current > SWING_COOLDOWN) {
        lastCountTimeRef.current = now
        setCounter(prev => prev + 1)
      }
    }
  }

  // ── Init MediaPipe ─────────────────────────
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true
    let mounted = true

    const init = async () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        })
      } catch (err) {
        console.error("Gagal akses kamera:", err)
        return
      }

      if (!mounted) {
        stream.getTracks().forEach(t => t.stop())
        return
      }

      video.srcObject = stream
      await video.play()

      // Tunggu dimensi valid
      await new Promise<void>(resolve => {
        const check = () => {
          if (!mounted) return
          if (video.videoWidth > 0 && video.videoHeight > 0) resolve()
          else requestAnimationFrame(check)
        }
        check()
      })
      if (!mounted) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const { Hands } = await import("@mediapipe/hands")
      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
      })
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      hands.onResults(onResults)
      handsRef.current = hands

      const loop = async () => {
        if (!mounted) return
        if (!isProcessingRef.current && video.readyState >= 2) {
          isProcessingRef.current = true
          try {
            await hands.send({ image: video })
          } catch (err) {
            console.error("MediaPipe error:", err)
          } finally {
            isProcessingRef.current = false
          }
        }
        setTimeout(() => {
          if (mounted) rafRef.current = requestAnimationFrame(loop)
        }, 1000 / 60)
      }

      if (mounted) rafRef.current = requestAnimationFrame(loop)
    }

    init()

    return () => {
      mounted = false
      isInitializedRef.current = false
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      handsRef.current?.close()
      const video = videoRef.current
      if (video?.srcObject) {
        ;(video.srcObject as MediaStream).getTracks().forEach(t => t.stop())
        video.srcObject = null
      }
    }
  }, [])

  return {
    videoRef,
    canvasRef,
    audioRef,
    counter,
    gameState,
    countdown,
    timeLeft,
    startGame,
    resetGame,
  }
}
