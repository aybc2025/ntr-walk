import s from './Recorder.module.css';

const TONE = { warn: 'var(--warn)', bad: 'var(--rec)', info: 'var(--line)' };

export default function Notice({ tone, text, dismiss }) {
  return (
    <div className={s.notice} role="status" style={{ boxShadow: `inset 4px 0 0 ${TONE[tone]}` }}>
      <span>{text}</span>
      {dismiss && <button type="button" className={s.ok} onClick={dismiss}>OK</button>}
    </div>
  );
}
