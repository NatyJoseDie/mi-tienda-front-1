'use client';

import { useEffect } from 'react';

export default function BackendWake() {
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    const url = `${base}/ping`;
    // Ping silencioso para calentar el backend
    fetch(url, { method: 'GET' }).catch(() => {});
  }, []);
  return null;
}