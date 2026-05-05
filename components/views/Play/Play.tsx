"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import usePlay from "./usePlay"

export default function Play() {
  const {
    videoRef,
    canvasRef,
    audioRef,
    counter,
    gameState,
    countdown,
    timeLeft,
    startGame,
    resetGame,
  } = usePlay()

  const { user } = useUser()
  const scoreSubmittedRef = useRef(false)

  // Reset flag when game isn't over
  useEffect(() => {
    if (gameState !== "GAME_OVER") {
      scoreSubmittedRef.current = false
    }
  }, [gameState])

  // Submit score when game is over
  useEffect(() => {
    if (gameState === "GAME_OVER" && user && !scoreSubmittedRef.current) {
      scoreSubmittedRef.current = true
      console.log("Submitting score:", counter)
      fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score: counter }),
      }).catch(err => {
        console.error("Failed to submit score", err)
        scoreSubmittedRef.current = false // allow retry if needed
      })
    }
  }, [gameState, user, counter])

  return (
    <div className="relative flex flex-col items-center justify-center flex-1 text-white overflow-hidden p-4">
      <audio ref={audioRef} src="/audio/kicau_mania.mp3" preload="auto" />
      <video ref={videoRef} playsInline className="hidden" />

      {/* Main Game Container */}
      <div className="relative flex items-center justify-center w-full mx-auto rounded-xl overflow-hidden bg-black shadow-2xl grow max-h-[75vh] max-w-7xl">
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-full object-cover"
        />

        {/* IDLE State Overlay */}
        {gameState === "IDLE" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <button
              onClick={startGame}
              className="px-10 py-3 text-xl font-bold bg-slate-600 hover:bg-slate-500 rounded-full shadow-lg transition-all mb-4"
            >
              Ready
            </button>
            <p className="text-slate-400 text-sm">
              klik tombol "Ready" untuk memulai permainan dan pastikan kamera
              sudah aktif.
            </p>
          </div>
        )}

        {/* COUNTDOWN State Overlay */}
        {gameState === "COUNTDOWN" && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-9xl font-bold text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-pulse">
              {countdown}
            </span>
          </div>
        )}

        {/* TIME LEFT Overlay */}
        {(gameState === "PLAYING" || gameState === "GAME_OVER") && (
          <div className="absolute top-4 right-4 bg-slate-800/80 px-6 py-2 rounded-2xl flex flex-col items-center border border-slate-700 z-10">
            <span className="text-xs font-semibold text-slate-300">
              Time Left
            </span>
            <span className="text-2xl font-bold text-white leading-none">
              {timeLeft}s
            </span>
          </div>
        )}

        {/* COUNTER IN PLAY OVERLAY */}
        {(gameState === "PLAYING" || gameState === "GAME_OVER") && (
          <div className="absolute top-4 left-4 bg-slate-800/80 px-6 py-2 rounded-2xl flex flex-col items-center border border-slate-700 z-10">
            <span className="text-xs font-semibold text-slate-300">Score</span>
            <span className="text-2xl font-bold text-white leading-none">
              {counter}
            </span>
          </div>
        )}
      </div>

      {/* GAME OVER POPUP */}
      {gameState === "GAME_OVER" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-700 min-w-[320px] text-center">
            <h2 className="text-3xl font-bold mb-2">Waktu Habis!</h2>
            <p className="text-slate-400 mb-4">Skor Akhir Kamu</p>
            <span className="text-8xl font-black text-white mb-8 drop-shadow-lg">
              {counter}
            </span>
            <button
              onClick={resetGame}
              className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-lg"
            >
              Pengulangan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
