import { shuffle, getTwo, getDistance } from '../utils'
import { sendFile } from '../utils/api'

export const POPULATION_SIZE = 4
export const MUTATION_RATE = 0.02
export const NUMBER_OF_GENERATIONS = 200000
export const EXPLONENTIAL_RATE = 8

class GeneticAlgorithm {
  constructor(file) {
    this.instance = {
      name: file.name,
      dimension: file.dimension,
      format: file.edge_weight_format,
      distances: file.distances,
      order: [...Array(file.dimension).keys()],
    }
    this.population = {
      paths: Array(POPULATION_SIZE),
      fitness: Array(POPULATION_SIZE),
    }
    this.best = {
      pathEver: this.instance.order,
      currentPath: this.instance.order,
      distance: Infinity,
    }
    this.time = {
      start: new Date(),
      end: null,
    }
  }

  populate = () => {
    const paths = Array(POPULATION_SIZE)
    for (let i = 0; i < POPULATION_SIZE; i++) {
      paths[i] = [...shuffle(this.instance.order)]
    }
    this.population.paths = paths
  }

  calculateDistance = path => {
    let distance = 0
    for (let i = 0; i < this.instance.dimension; i++) {
      const neighbor = (i + 1) % path.length
      distance += getDistance(
        path[i],
        path[neighbor],
        this.instance.format,
        this.instance.distances
      )
    }
    return distance
  }

  // Calcula a fitness de cada caminho da populacao
  calculateFitness = () => {
    // a ideia aqui eh fazer a curva de fitness ser exponencial
    // para que a menor distancia seja sempre mais provavel de ser escolhida
    let currentBestDistance = Infinity
    let totalFitness = 0
    this.population.paths.forEach((path, index) => {
      const distance = this.calculateDistance(path)
      this.population.fitness[index] =
        1 / (Math.pow(distance, EXPLONENTIAL_RATE) + 1)
      totalFitness += this.population.fitness[index]

      if (distance < currentBestDistance) {
        currentBestDistance = distance
        this.best.current = path
      }
      if (distance < this.best.distance) {
        this.best.distance = distance
        this.best.pathEver = path
      }
    })

    // normalizando a fitness pra fazer mais sentido
    this.population.fitness = this.population.fitness.map(
      fitness => fitness / totalFitness
    )
  }

  // para cara caminho da populacao, escolhe um caminho aleatoriamente
  // e seu vizinho e faz cross over e mutacao para gerar uma nova geracao
  nextGeneration = () => {
    this.population.paths = this.population.paths.map(() => {
      const { pathA, pathB } = getTwo(
        this.population.paths,
        this.population.fitness
      )
      return this.mutate(this.crossOver(pathA, pathB))
    })
  }

  crossOver = (pathA, pathB) => {
    const start = Math.floor(Math.random() * this.instance.dimension)
    const end = Math.floor(
      Math.random() * (this.instance.dimension - start + 1) + start
    )
    let newPath = pathA.slice(start, end)

    // percorrer o segundo caminho botando na ordem
    // todas as cidades que ainda nao estao no novo caminho
    pathB.forEach(city => {
      if (!newPath.includes(city)) {
        newPath.push(city)
      }
    })
    return newPath
  }

  // trocar dois vizinhos de lugar considerando mutation rate
  mutate = path => {
    for (let i = 0; i < this.instance.dimension; i++) {
      if (Math.random() < MUTATION_RATE) {
        this.swapCity(path, i, (i + 1) % this.instance.dimension)
      }
    }
    return path
  }

  swapCity = (path, indexA, indexB) => {
    const aux = path[indexA]
    path[indexA] = path[indexB]
    path[indexB] = aux
    return path
  }

  findSmallestPath = () => {
    this.populate()
    for (let i = 0; i < NUMBER_OF_GENERATIONS; i++) {
      this.calculateFitness()
      this.nextGeneration()
      //console.log(((i + 1) / NUMBER_OF_GENERATIONS) * 100)
    }
    this.time.end = new Date()
    const seconds = (this.time.end.getTime() - this.time.start.getTime()) / 1000

    sendFile({
      algorithm: 'genetic',
      instance: this.instance.name,
      duration: `${seconds} s`,
      cost: this.best.distance,
      path: this.best.pathEver,
    }).then(response => console.log(response))
  }
}

export default GeneticAlgorithm
