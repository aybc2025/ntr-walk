import s from './NewWalk.module.css';

export default function Segmented({ id, label, options, value, onChange }) {
  return (
    <fieldset className={s.field}>
      <legend className={s.label}>{label}</legend>
      <div className={s.seg} role="radiogroup" aria-labelledby={`${id}-l`}>
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" id={`${id}-${o.value}`} aria-checked={value === o.value}
            className={value === o.value ? s.on : undefined} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </fieldset>
  );
}
