import { useRef, useEffect } from 'react'

import { types } from '../constants'

export function shuffle(array) {
  let i = array.length - 1
  for (i; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

export function getTwo(paths, fitness) {
  return {
    pathA: getOne(paths, fitness),
    pathB: getOne(paths, fitness),
  }
}

export function getOne(paths, fitness) {
  let random = Math.random()
  let pos = 0

  for (let pos = 0; pos < paths.length; pos++) {
    random -= fitness[pos]
    if (random < 0) return paths[pos]
  }

  return paths[pos]
}

export function getDistance(a, b, format, distances) {
  let col, line

  if (format === types.LOWER_DIAG_ROW) {
    line = Math.max(a, b)
    col = Math.min(a, b)
  } else {
    line = Math.min(a, b)
    col = Math.max(a, b) - line
  }
  return distances[line][col]
}

export const calculatePathSize = (path, instance) => {
  let distance = 0
  for (let i = 0; i < instance.dimension; i++) {
    const neighbor = (i + 1) % path.length
    distance += getDistance(
      path[i],
      path[neighbor],
      instance.format,
      instance.distances
    )
  }
  return distance
}
