// components/LoadingSpinner.tsx
import React from 'react'

type Props = {
  small?: boolean
}

export default function LoadingSpinner({ small }: Props) {
  const size = small ? 16 : 32
  const border = small ? 2 : 4

  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${border}px solid rgba(255, 255, 255, 0.2)`,
        borderTop: `${border}px solid rgba(255, 255, 255, 0.7)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  )
}
