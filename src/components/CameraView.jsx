import { useEffect, useRef } from 'react';
import s from './Recorder.module.css';

export default function CameraView({ stream }) {
  const v = useRef(null);
  useEffect(() => { if (v.current) v.current.srcObject = stream || null; }, [stream]);
  return <video ref={v} className={s.video} muted playsInline autoPlay aria-label="Camera" />;
}
