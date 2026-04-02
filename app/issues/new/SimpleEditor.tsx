'use client'

import dynamic from 'next/dynamic'
import { Controller } from 'react-hook-form'
import "easymde/dist/easymde.min.css"

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
})

export default function SimpleEditor({ control }: any) {
  return (
    <Controller
      name="description"
      control={control}
      render={({ field }) => (
        <SimpleMDE {...field} />
      )}
    />
  )
}