interface Props {
  on: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}

export function Toggle({ on, onChange, ariaLabel }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      className={`w2f-toggle ${on ? 'on' : ''}`}
      onClick={() => onChange(!on)}
    />
  );
}
