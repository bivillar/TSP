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

    const seconds = (this.time.end.getTime() - this.time.start.getTime()) / 1000
    sendFile({
      algorithm: 'farthest',
      instance: this.instance.name,
      duration: `${seconds} s`,
      cost: min,
      path: bestPath,
    }).then(response => console.log(response))
  }
}

export default FarthestInsertion
