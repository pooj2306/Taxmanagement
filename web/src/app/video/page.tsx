"use client";
import { useEffect, useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";

export default function VideoPage() {
  const supabase = createSupabaseClient();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;
    pc.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0];
    };
    return () => {
      pc.close();
    };
  }, []);

  const start = async () => {
    setStarted(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localRef.current) localRef.current.srcObject = stream;
    stream.getTracks().forEach((t) => pcRef.current?.addTrack(t, stream));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Video Call (P2P)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <video ref={localRef} autoPlay muted playsInline className="w-full bg-black rounded" />
        <video ref={remoteRef} autoPlay playsInline className="w-full bg-black rounded" />
      </div>
      {!started && (
        <button onClick={start} className="bg-black text-white rounded px-4 py-2">Start</button>
      )}
      <p className="text-sm text-gray-600">Signaling via Supabase Realtime will be added.</p>
    </div>
  );
}
