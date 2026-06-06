// AlgoFlow brand logo — geometric hexagon with flow arrows
const AppLogo = ({
  width = 36,
  height = 36,
  className = "",
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Hexagon bg */}
    <polygon
      points="24,2 43,13 43,35 24,46 5,35 5,13"
      fill="oklch(0.75 0.18 195)"
      opacity="0.15"
    />
    <polygon
      points="24,2 43,13 43,35 24,46 5,35 5,13"
      fill="none"
      stroke="oklch(0.75 0.18 195)"
      strokeWidth="2"
    />
    {/* Flow path inside */}
    <circle cx="24" cy="16" r="4" fill="oklch(0.75 0.18 195)" />
    <circle cx="14" cy="30" r="3" fill="oklch(0.75 0.18 195)" opacity="0.7" />
    <circle cx="34" cy="30" r="3" fill="oklch(0.75 0.18 195)" opacity="0.7" />
    <line x1="24" y1="20" x2="16" y2="27" stroke="oklch(0.75 0.18 195)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="20" x2="32" y2="27" stroke="oklch(0.75 0.18 195)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default AppLogo;
