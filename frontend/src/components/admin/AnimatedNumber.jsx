import { useEffect, useState, useRef } from "react";

export default function AnimatedNumber({ value, prefix = "", duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  const isDecimal = !Number.isInteger(Number(value));
  const formatted = isDecimal
    ? display.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : Math.round(display).toLocaleString("en-BD");

  return <>{prefix}{formatted}</>;
}