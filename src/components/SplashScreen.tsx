"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { needsAudioGesture } from "@/lib/device";

interface SplashScreenProps {
  onComplete: () => void;
  onEnter?: () => void;
  dataReady?: boolean;
}

const MIN_DURATION = 1800;

export default function SplashScreen({
  onComplete,
  onEnter,
  dataReady = true,
}: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [requireTap] = useState(() => needsAudioGesture());
  const onCompleteRef = useRef(onComplete);
  const onEnterRef = useRef(onEnter);
  const doneRef = useRef(false);

  onCompleteRef.current = onComplete;
  onEnterRef.current = onEnter;

  const finish = useCallback(() => {
    if (doneRef.current || !dataReady || !minTimePassed) return;
    doneRef.current = true;
    setVisible(false);
    setTimeout(() => onCompleteRef.current(), 450);
  }, [dataReady, minTimePassed]);

  const handleEnter = useCallback(() => {
    if (!dataReady || !minTimePassed || doneRef.current) return;
    onEnterRef.current?.();
    finish();
  }, [dataReady, minTimePassed, finish]);

  useEffect(() => {
    const start = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const timePct = Math.min((elapsed / MIN_DURATION) * 90, 90);
      const pct = dataReady ? Math.min(timePct + (elapsed >= MIN_DURATION ? 10 : 0), 100) : timePct;
      setProgress(pct);

      if (elapsed >= MIN_DURATION) {
        setMinTimePassed(true);
      }
    }, 30);

    return () => clearInterval(progressTimer);
  }, [dataReady]);

  useEffect(() => {
    if (!requireTap && dataReady && minTimePassed) {
      setProgress(100);
      const t = setTimeout(finish, 300);
      return () => clearTimeout(t);
    }
  }, [requireTap, dataReady, minTimePassed, finish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          onTouchStart={requireTap ? handleEnter : undefined}
          onClick={requireTap ? handleEnter : undefined}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden select-none ${
            requireTap && dataReady && minTimePassed ? "cursor-pointer" : ""
          }`}
        >
          <div className="absolute inset-0 bg-[#0a2e2b]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, #1B4D4A 0%, transparent 70%)",
            }}
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[600px] h-[600px] opacity-[0.07]"
            style={{
              background:
                "conic-gradient(from 0deg, #91C13E, transparent 30%, #F19E05, transparent 60%, #91C13E)",
            }}
          />

          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-olive-fresh/40"
              style={{ top: `${20 + i * 12}%`, left: `${10 + i * 14}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{
                duration: 2 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="relative z-10 flex flex-col items-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-52 h-52 rounded-full bg-olive-fresh/20 blur-2xl"
            />

            <div className="relative w-40 h-40 mb-5">
              <Image
                src="/logo-ar.png"
                alt="روح الحياة"
                fill
                className="object-contain drop-shadow-[0_0_30px_rgba(145,193,62,0.4)]"
                priority
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="font-heading font-bold text-white text-2xl tracking-wide">
                روح الحياة
              </h1>
              <p className="text-olive-fresh/70 text-[11px] font-latin tracking-[0.2em] uppercase mt-1">
                Spirito Vita
              </p>
            </motion.div>
          </motion.div>

          <div className="absolute bottom-16 left-8 right-8 z-10">
            <div className="h-[3px] bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-l from-amber-gold via-olive-fresh to-amber-gold transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-white/40 text-xs font-arabic">
              {!dataReady
                ? "جاري تحميل القائمة..."
                : minTimePassed
                  ? requireTap
                    ? "المس الشاشة للدخول 🎵"
                    : "مرحباً بك في روح الحياة"
                  : "مرحباً بك..."}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
