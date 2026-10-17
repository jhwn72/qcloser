// The Q logo: Tango's glass ring with a light-weight Q inside.
export default function QMark({ size = 72, font = 28 }: { size?: number; font?: number }) {
  const r = size * 0.43;
  return (
    <span className="q-mark" style={{ width: size, height: size }}>
      <span
        className="tg-glass-ring"
        style={{ width: size, height: size, ["--r" as string]: `${r}px`, ["--w" as string]: `${Math.max(2, size / 24)}px` }}
      >
        <i className="bloom" />
        <i className="track" />
        <i className="ch red" />
        <i className="ch green" />
        <i className="ch blue" />
        <i className="hot" />
        <i className="streaks" />
      </span>
      <b style={{ fontSize: font }}>Q</b>
    </span>
  );
}
