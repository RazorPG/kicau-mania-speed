"use client"
import { useEffect, useRef, useState } from "react"

function usePlay() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Karena setiap tangan butuh history pergerakannya sendiri-sendiri, kita pakai object/dictionary
  const historyRef = useRef<{ [key: number]: number[] }>({})
  const handsRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)

  const isProcessingRef = useRef(false)
  const isInitializedRef = useRef(false)
  const lastCountTimeRef = useRef(0)

  const [counter, setCounter] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)

  type GameState = "IDLE" | "COUNTDOWN" | "PLAYING" | "GAME_OVER"
  const [gameState, setGameState] = useState<GameState>("IDLE")
  const gameStateRef = useRef<GameState>("IDLE")
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(15)

  const updateGameState = (newState: GameState) => {
    gameStateRef.current = newState
    setGameState(newState)
  }

  const startGame = () => {
    setCounter(0)
    setCountdown(3)
    setTimeLeft(15)
    updateGameState("COUNTDOWN")

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.error("Audio play failed:", e))
    }
  }

  const resetGame = () => {
    setCounter(0)
    updateGameState("IDLE")

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === "COUNTDOWN") {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            updateGameState("PLAYING")
            return 3
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === "PLAYING") {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
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
    }
    return () => clearInterval(timer)
  }, [gameState])

  const SWING_COOLDOWN = 300 // ms
  const UMBRAL_AGITACION = 0.04
  const MAX_FRAMES = 8
  const FACE_X = 0.5
  const FACE_Y = 0.35
  const UMBRAL_CERCA_CARA = 0.25

  // =========================
  // HELPER FUNCTIONS
  // =========================

  const isFingerUp = (lm: any, tip: number, base: number) => {
    return lm[tip].y < lm[base].y
  }

  const isHandOpen = (lm: any) => {
    const count = [
      isFingerUp(lm, 8, 6),
      isFingerUp(lm, 12, 10),
      isFingerUp(lm, 16, 14),
      isFingerUp(lm, 20, 18),
    ].filter(Boolean).length
    return count >= 3
  }

  const isHandNearFace = (lm: any) => {
    // lm[0] adalah pangkal telapak tangan (wrist)
    const dx = lm[0].x - FACE_X
    const dy = lm[0].y - FACE_Y
    return Math.sqrt(dx * dx + dy * dy) < UMBRAL_CERCA_CARA
  }

  const checkIsHandWaving = (hist: number[]) => {
    if (hist.length < MAX_FRAMES) return false
    const max = Math.max(...hist)
    const min = Math.min(...hist)
    if (max - min < UMBRAL_AGITACION) return false

    let directionChanges = 0
    for (let i = 1; i < hist.length - 1; i++) {
      if (
        (hist[i] > hist[i - 1] && hist[i] > hist[i + 1]) ||
        (hist[i] < hist[i - 1] && hist[i] < hist[i + 1])
      ) {
        directionChanges++
      }
    }
    return directionChanges >= 1
  }

  const checkIsNewSwing = (hist: number[]) => {
    if (hist.length < 3) return false
    const i = hist.length - 2
    // Cek apakah data sebelumnya merupakan puncak atau lembah
    const isPeak = hist[i] > hist[i - 1] && hist[i] > hist[hist.length - 1]
    const isValley = hist[i] < hist[i - 1] && hist[i] < hist[hist.length - 1]
    const amplitude = Math.max(...hist) - Math.min(...hist)
    return (isPeak || isValley) && amplitude >= UMBRAL_AGITACION
  }

  const onResults = (results: any) => {
    // 1. Dapatkan Canvas & Gambarkan videonya
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Gambarkan gambar asli/video (yang dikembalikan oleh MediaPipe) ke canvas
    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
    }

    if (
      !results.multiHandLandmarks ||
      results.multiHandLandmarks.length === 0
    ) {
      ctx.restore()
      return
    }

    // 2. Jika ada tangan, gambar Landmarks (Tulang Jari)
    ctx.strokeStyle = "#00FF00" // Warna garis (Hijau)
    ctx.lineWidth = 3
    ctx.fillStyle = "#FF0000" // Warna titik jari (Merah)

    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4], // Jempol
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8], // Telunjuk
      [5, 9],
      [9, 10],
      [10, 11],
      [11, 12], // Tengah
      [9, 13],
      [13, 14],
      [14, 15],
      [15, 16], // Manis
      [13, 17],
      [17, 18],
      [18, 19],
      [19, 20], // Kelingking
      [0, 17], // Pangkal tangan
    ]

    // Loop untuk KEDUA tangan (atau lebih)
    results.multiHandLandmarks.forEach((lm: any) => {
      connections.forEach(([start, end]) => {
        const pt1 = lm[start]
        const pt2 = lm[end]
        ctx.beginPath()
        ctx.moveTo(pt1.x * canvas.width, pt1.y * canvas.height)
        ctx.lineTo(pt2.x * canvas.width, pt2.y * canvas.height)
        ctx.stroke()
      })

      lm.forEach((point: any) => {
        ctx.beginPath()
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          4,
          0,
          2 * Math.PI
        )
        ctx.fill()
      })
    })

    ctx.restore()

    // 3. Logika Penghitungan Pergerakan Dua Tangan
    let tangan_lambai_terdeteksi = false
    let tangan_di_mulut_terdeteksi = false
    let ayunan_baru = false

    // Bersihkan history tangan yang sudah tak terdeteksi
    if (results.multiHandedness) {
      const currentIdxs = new Set(
        results.multiHandedness.map((h: any) => h.index)
      )
      Object.keys(historyRef.current).forEach(key => {
        if (!currentIdxs.has(Number(key))) {
          delete historyRef.current[Number(key)]
        }
      })
    }

    if (results.multiHandLandmarks && results.multiHandedness) {
      results.multiHandLandmarks.forEach((lm: any, idx: number) => {
        const handIdx = results.multiHandedness[idx].index
        if (!historyRef.current[handIdx]) {
          historyRef.current[handIdx] = []
        }

        const hist = historyRef.current[handIdx]
        const xCentro = lm[9].x

        // -- Deteksi Lambai --
        if (isHandOpen(lm)) {
          hist.push(xCentro)
          if (hist.length > MAX_FRAMES) hist.shift()

          if (checkIsHandWaving(hist)) {
            tangan_lambai_terdeteksi = true

            // Cek ayunan baru persis seperti python: `hitung_ayunan`
            if (checkIsNewSwing(hist)) {
              ayunan_baru = true
            }
          }
        } else {
          // Tetap update history kalau gak lambai (seperti Python)
          hist.push(xCentro)
          if (hist.length > MAX_FRAMES) hist.shift()
        }

        // -- Deteksi Tangan di Mulut/Wajah --
        if (isHandNearFace(lm)) {
          tangan_di_mulut_terdeteksi = true
        }
      })
    }

    const gesto_activo = tangan_lambai_terdeteksi && tangan_di_mulut_terdeteksi

    // COUNTER: naik hanya saat gesture aktif + ayunan baru selesai
    if (gesto_activo && ayunan_baru) {
      const now = Date.now()
      if (
        now - lastCountTimeRef.current > SWING_COOLDOWN &&
        gameStateRef.current === "PLAYING"
      ) {
        lastCountTimeRef.current = now
        setCounter(prev => prev + 1)
      }
    }
  }

  // =========================
  // INIT MEDIAPIPE
  // =========================

  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    let mounted = true

    const init = async () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      // ✅ Step 1: Minta akses kamera manual (bukan lewat MediaPipe Camera)
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

      // Jika komponen keburu di-unmount selagi menunggu izin kamera
      if (!mounted) {
        stream.getTracks().forEach(track => track.stop())
        return
      }

      video.srcObject = stream
      await video.play()

      // ✅ Step 2: Tunggu video benar-benar punya dimensi valid
      await new Promise<void>(resolve => {
        const check = () => {
          if (!mounted) return
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            resolve()
          } else {
            requestAnimationFrame(check)
          }
        }
        check()
      })

      if (!mounted) return

      // Set canvas sesuai ukuran video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")!

      // ✅ Step 3: Load MediaPipe Hands
      const { Hands } = await import("@mediapipe/hands")

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`,
      })

      hands.setOptions({
        maxNumHands: 2, // Diubah menjadi 2 agar bisa mendeteksi tangan kiri & kanan
        modelComplexity: 0, // 0 = Lite (lebih cepat), 1 = Full (lebih akurat). Lite mencegah bug gagal load .tflite
        minDetectionConfidence: 0.5, // Sedikit diturunkan agar lebih gampang detect 2 tangan
        minTrackingConfidence: 0.5,
      })

      hands.onResults(onResults)
      handsRef.current = hands

      // ✅ Step 4: Loop manual pakai requestAnimationFrame
      const loop = async () => {
        if (!mounted) return

        if (!isProcessingRef.current && video.readyState >= 2) {
          isProcessingRef.current = true
          try {
            // Gambar Canvas dipindahkan ke onResults sepenuhnya untuk mencegah flicker
            // Kirim video langsung ke MediaPipe
            await hands.send({ image: video })
          } catch (err) {
            console.error("MediaPipe error:", err)
          } finally {
            isProcessingRef.current = false
          }
        }

        setTimeout(() => {
          if (mounted) {
            rafRef.current = requestAnimationFrame(loop)
          }
        }, 1000 / 60) // Batasi sekitar 60 FPS untuk mencegah memori WASM penuh
      }

      // Langsung panggil loop karena video sudah pasti siap (kita sudah await dimensinya di atas)
      if (mounted) {
        rafRef.current = requestAnimationFrame(loop)
      }
    }

    init()

    return () => {
      mounted = false
      isInitializedRef.current = false

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }

      if (handsRef.current) {
        handsRef.current.close()
      }

      // Matikan stream kamera
      const video = videoRef.current
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
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

export default usePlay
