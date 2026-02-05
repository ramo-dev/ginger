'use client'

import type { ReactNode } from 'react'
import { FetchContentToolUI } from './FetchContent'

export const ToolProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <FetchContentToolUI />
      {children}
    </>
  )
}
