interface AvatarProps {
  initials: string
  color: string
  size?: number
  radius?: number
  fontSize?: number
}

export default function Avatar({ initials, color, size = 46, radius = 14, fontSize = 16 }: AvatarProps) {
  return (
    <div
      className="flex items-center justify-center font-extrabold text-white shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: color,
        fontSize,
      }}
    >
      {initials}
    </div>
  )
}
