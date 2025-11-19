export interface Cue {
  id: string
  startTime: number
  endTime: number
  camera: number
  description: string
  color: string
}

export interface CueDocument {
  title: string
  num: number
  videoPath: string
  framerate: number // in fps
  cues: Cue[]
}

export const CAMERA_COLORS: { [key: number]: string } = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-yellow-600',
  4: 'bg-cyan-500',
  5: 'bg-red-500',
  6: 'bg-purple-500',
  7: 'bg-lime-500',
  8: 'bg-emerald-500',
  9: 'bg-orange-500',
  10: 'bg-rose-500',
  11: 'bg-amber-700',
  12: 'bg-teal-500',
  13: 'bg-red-700',
  14: 'bg-gray-400',
  15: 'bg-indigo-500',
  16: 'bg-yellow-400',
  17: 'bg-brown-500',
  18: 'bg-pink-500',
  19: 'bg-fuchsia-500',
  20: 'bg-sky-500',
  21: 'bg-red-400',
  22: 'bg-green-600',
  23: 'bg-orange-600',
  24: 'bg-indigo-700',
  25: 'bg-gray-200'
}

export const getCameraColor = (camera: number): string => {
  return CAMERA_COLORS[camera] || 'bg-gray-600'
}

export const formatDuration = (seconds: number): string => {
  if (seconds < 0) return ''
  const floored = Math.floor(seconds)
  return `:${floored.toString().padStart(2, '0')}`
}
