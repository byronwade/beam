"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, className = "", decimals = 0 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const prevValue = useRef(0);

  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  const display = useTransform(spring, (current) => {
    if (decimals > 0) {
      return current.toFixed(decimals);
    }
    return Math.round(current).toString();
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [display]);

  // Animate color flash when value changes
  const hasIncreased = value > prevValue.current;
  useEffect(() => {
    prevValue.current = value;
  }, [value]);

  return (
    <motion.span
      className={className}
      animate={
        hasIncreased
          ? {
              color: ["inherit", "#10b981", "inherit"],
            }
          : {}
      }
      transition={{ duration: 0.5 }}
    >
      {displayValue}
    </motion.span>
  );
}
