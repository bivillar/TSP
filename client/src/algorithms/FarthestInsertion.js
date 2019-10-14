import { getDistance, calculatePathSize } from '../utils'
import { sendFile } from '../utils/api'
// A ideia é começar com um caminho de uma cidade e ir adicionando
// os vertices mais distantes nos lugares que gerem a menor distancia
class FarthestInsertion {
  constructor(file) {
    this.instance = {
      name: file.name,
      dimension: file.dimension,
      format: file.edge_weight_format,
      distances: file.distances,
      order: [...Array(file.dimension).keys()],
    }
    this.best = {
      pathEver: this.instance.order,
      currentPath: this.instance.order,
      distance: Infinity,
    }
    this.notInserted = [...Array(file.dimension).keys()]
    this.time = {
      start: new Date(),
      end: null,
    }
  }

  findAndInsertFarthest = path => {
    let totalDistance, notInsertedIndex, farCity
    let numOfNotInserted = this.notInserted.length
    let numOfInserted = path.length
    let max = 0

    if (numOfNotInserted > 1) {
      // passo 1: pegar cada um dos vértices já inseridos e procurar
      // o vertice não inserido mais longe

      for (let i = 0; i < numOfNotInserted; i++) {
        totalDistance = path.reduce((total, city) => {
          const dist =
            total +
            getDistance(
              city,
              this.notInserted[i],
              this.instance.format,
              this.instance.distances
            )

          return dist
        }, 0)
        if (totalDistance > max) {
          max = totalDistance
          farCity = this.notInserted[i]
          notInsertedIndex = i
        }
      }
    } else {
      farCity = this.notInserted[0]
      notInsertedIndex = 0
    }

    // Passo 2: achar o melhor lugar para inserir
    let min = Infinity
    let bestPlace
    for (let i = 0; i < numOfInserted; i++) {
      const neighbor = (i + 1) % numOfInserted

      const adding =
        getDistance(
          path[i],
          farCity,
          this.instance.format,
          this.instance.distances
        ) +
        getDistance(
          farCity,
          path[neighbor],
          this.instance.format,
          this.instance.distances
        )

      const notAdding = getDistance(
        path[i],
        path[neighbor],
        this.instance.format,
        this.instance.distances
      )
      const diference = adding - notAdding

      if (diference < min) {
        min = diference
        bestPlace = i
      }
    }

    // tirar essa cidade dos não inseridos
    this.notInserted = [
      ...this.notInserted.slice(0, notInsertedIndex),
      ...this.notInserted.slice(notInsertedIndex + 1),
    ]

    // inserir
    return [
      ...path.slice(0, bestPlace + 1),
      farCity,
      ...path.slice(bestPlace + 1),
    ]
  }

  generatePath = city => {
    this.notInserted = [...Array(this.instance.dimension).keys()]
    let path = [city]

    // remove a cidade dos nao inseridos
    this.notInserted = [
      ...this.notInserted.slice(0, city),
      ...this.notInserted.slice(city + 1),
    ]

    for (let i = 0; i < this.instance.dimension - 1; i++) {
      path = this.findAndInsertFarthest(path)
    }
    return path
  }

  // pega uma parte do caminho e inverte
  flip = (start, end, path) => {
    return [
      ...path.slice(0, start),
      ...path.slice(start, end).reverse(),
      ...path.slice(end),
    ]
  }

  // testa se fazer o flip seria bom para o caminho
  two_op = path => {
    const numberOfCities = this.instance.dimension
    const { format, distances } = this.instance
    let newPath = path
    let stop = false

    while (!stop) {
      stop = true
      for (let i = 1; i < Math.floor(numberOfCities / 2); i++) {
        for (let posA = 0; posA < numberOfCities; posA++) {
          const posB = (posA + i) % numberOfCities
          const a = path[posA]
          // vizinho anterior a A
          const neighborA = path[posA - 1 > 0 ? posA - 1 : numberOfCities - 1]
          const b = path[posB]
          // vizinho seguinte a B
          const neighborB = path[(posB + 1) % numberOfCities]
          const dist = {
            nA_b: getDistance(neighborA, b, format, distances),
            nA_a: getDistance(neighborA, a, format, distances),
            nB_b: getDistance(neighborB, b, format, distances),
            nB_a: getDistance(neighborB, a, format, distances),
          }
          const distWithFlip = dist.nA_b + dist.nB_a
          const distWithoutFlip = dist.nA_a + dist.nB_b

          if (distWithFlip < distWithoutFlip) {
            newPath = this.flip(posA, posB, newPath)
            stop = false
          } else {
            return newPath
          }
        }
      }
    }
    return newPath
  }

  findSmallestPath = () => {
    let path, totalDistance
    let min = Infinity
    const bestPath = this.instance.order.reduce((best, city) => {
      path = this.generatePath(city)
      totalDistance = calculatePathSize(path, this.instance)
      if (totalDistance < min) {
        min = totalDistance
        best = path
      }
      return best
    }, null)

    this.best.distance = min
    this.best.pathEver = bestPath
    this.time.end = new Date()
    this.improve()

    const seconds = (this.time.end.getTime() - this.time.start.getTime()) / 1000
    sendFile({
      algorithm: 'farthest',
      instance: this.instance.name,
      duration: `${seconds} s`,
      cost: min,
      path: bestPath,
    }).then(response => console.log(response))
  }

  improve = () => {
    const newPath = this.two_op(this.best.pathEver)
    const totalSize = calculatePathSize(newPath, this.instance)
    this.best.two_op = { newPath, totalSize }
  }
}

export default FarthestInsertion
