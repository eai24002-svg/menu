"use client";

import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { getBackgroundMusicUrl } from "@/lib/audio";
import { needsAudioGesture } from "@/lib/device";

interface AudioContextValue {
  isPlaying: boolean;
  toggle: () => void;
  /** Must be called synchronously inside a user gesture (tap) on iOS */
  startFromGesture: () => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({
  children,
  musicUrl,
}: {
  children: React.ReactNode;
  musicUrl?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockListenersRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const src = getBackgroundMusicUrl(musicUrl);

  const removeUnlockListeners = useCallback(() => {
    unlockListenersRef.current?.();
    unlockListenersRef.current = null;
  }, []);

  const playNow = useCallback((audio: HTMLAudioElement) => {
    audio.muted = false;
    audio.volume = 0.35;
    if (audio.readyState < 2) {
      audio.load();
    }
    const promise = audio.play();
    if (promise) promise.catch(() => {});
    return promise;
  }, []);

  const tryAutoplay = useCallback(
    (audio: HTMLAudioElement) => {
      if (needsAudioGesture()) return;

      playNow(audio).catch(() => {
        const unlock = () => {
          playNow(audio);
          removeUnlockListeners();
        };

        removeUnlockListeners();
        document.addEventListener("touchstart", unlock, { once: true, passive: true });
        document.addEventListener("click", unlock, { once: true });
        unlockListenersRef.current = () => {
          document.removeEventListener("touchstart", unlock);
          document.removeEventListener("click", unlock);
        };
      });
    },
    [playNow, removeUnlockListeners]
  );

  useEffect(() => {
    setReady(false);
    const wasPlaying = audioRef.current && !audioRef.current.paused;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("canplaythrough", () => {
      setReady(true);
      tryAutoplay(audio);
    });
    audio.addEventListener("error", () => setReady(true));

    audio.load();

    if (wasPlaying) {
      tryAutoplay(audio);
    }

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audioRef.current = null;
      removeUnlockListeners();
    };
  }, [src, tryAutoplay, removeUnlockListeners]);

  const startFromGesture = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playNow(audio);
    removeUnlockListeners();
  }, [playNow, removeUnlockListeners]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
    } else {
      playNow(audio);
    }
  }, [playNow]);

  return (
    <AudioCtx.Provider value={{ isPlaying, toggle, startFromGesture }}>
      {children}
      {ready && (
        <motion.button
          type="button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className={`fixed z-30 bottom-[5.75rem] left-3 max-w-lg mx-auto pointer-events-auto w-9 h-9 rounded-full backdrop-blur-md shadow-md border flex items-center justify-center safe-bottom ${
            isPlaying
              ? "bg-teal-deep/80 border-olive-fresh/40 text-olive-fresh"
              : "bg-teal-deep/50 border-white/20 text-white/70"
          }`}
          style={{ marginLeft: "max(0.75rem, env(safe-area-inset-left))" }}
          aria-label={isPlaying ? "كتم الصوت" : "تشغيل الصوت"}
        >
          {isPlaying ? (
            <Volume2 size={17} />
          ) : (
            <VolumeX size={17} />
          )}
        </motion.button>
      )}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
