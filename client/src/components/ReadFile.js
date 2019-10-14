import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'

import { types } from '../constants'
import GeneticAlgorithm from '../algorithms/Genetic'
import FarthestInsertion from '../algorithms/FarthestInsertion'
import Progress from './Progress'
import Result from './Result'

const EDGE_WEIGHT_SECTION = 'EDGE_WEIGHT_SECTION'
const DISPLAY_DATA_SECTION = 'DISPLAY_DATA_SECTION'

class ReadFile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: {},
      loading: false,
      done: false,
      distace: 0,
      bestPathEver: [],
      two_op: {},
      getType: props.getType,
    }
  }

  showFile = async e => {
    e.preventDefault()
    const reader = new FileReader()
    reader.onload = async e => {
      const text = e.target.result
      const file = this.normalizeFile(text)
      this.setState({ file })
    }
    reader.readAsText(e.target.files[0])
    this.setState({ done: false })
  }

  normalizeFile = text => {
    const file = {}
    text.split('\n').forEach(line => {
      if (line.includes(':')) {
        const key = line
          .replace(/\:.*$/, ' ')
          .replace(' ', '')
          .toLocaleLowerCase()
        file[key] = line.match(/\:.*$/)[0].replace(/:| /g, '')
      }
    })
    // file.edge_weight_section = text.indexOf("EDGE_WEIGHT_SECTION")
    const start = text.indexOf(EDGE_WEIGHT_SECTION) + EDGE_WEIGHT_SECTION.length
    const end =
      text.indexOf(DISPLAY_DATA_SECTION) > -1
        ? text.indexOf(DISPLAY_DATA_SECTION)
        : text.length - 4

    file.edge_weight_section = text
      .slice(start, end)
      .trim()
      .replace(/\s+/g, ',')
      .split(',')
      .map(value => Number(value))

    file.dimension = Number(file.dimension)
    file.distances = this.getMatrix(file)
    return file
  }

  getMatrix = file => {
    const { dimension, edge_weight_format, edge_weight_section } = file

    let matrix = [[]]
    let line = 0

    switch (edge_weight_format) {
      case types.LOWER_DIAG_ROW:
        edge_weight_section.forEach((number, index) => {
          matrix[line].push(number)
          if (number === 0 && index + 1 < edge_weight_section.length) {
            matrix[++line] = []
          }
        })
        return matrix
      case types.UPPER_DIAG_ROW:
        edge_weight_section.forEach((number, index) => {
          if (index > 0 && number === 0) {
            matrix[++line] = []
          }
          matrix[line].push(number)
        })
        return matrix
      case types.UPPER_ROW:
        matrix[0] = [0]
        let start = 0
        let end = dimension - 1
        for (let i = 0; i < dimension; i++) {
          matrix[i] = [0, ...edge_weight_section.slice(start, end)]
          start = end
          end += dimension - i - 2
        }
        return matrix
    }
  }

  solve = () => {
    let results
    if (this.state.getType() == 'Genetic')
      results = this.geneticAlg(this.state.file)
    else results = this.farthestInsertion(this.state.file)

    this.setState({
      loading: false,
      done: true,
      ...results,
    })

    console.log('BEST', results.distance, results.bestPathEver)
  }

  farthestInsertion = file => {
    const fi = new FarthestInsertion(file)
    fi.findSmallestPath()
    console.log(fi.best.two_op)

    return {
      bestPathEver: fi.best.pathEver,
      distance: fi.best.distance,
      two_op: fi.best.two_op,
    }
  }

  geneticAlg = file => {
    const ga = new GeneticAlgorithm(file)
    ga.findSmallestPath()

    return {
      bestPathEver: ga.best.pathEver,
      distance: ga.best.distance,
    }
  }

  render = () => {
    const { file, loading, done, distance, bestPathEver, two_op } = this.state
    const { name, kps } = file
    return (
      <Fragment>
        <h1>
          {name && `${name} (KPS: ${kps}) `}
          <Progress className="pl3" loading={loading} done={done} />
        </h1>
        {done && (
          <Result distance={distance} path={bestPathEver} two_op={two_op} />
        )}
        <div className="pb2">
          <input
            type="file"
            onChange={e => this.showFile(e)}
            style={{ width: '70%' }}
          />
        </div>
        <Button
          disabled={!name}
          variant="info"
          onClick={() => {
            this.setState({ loading: true, done: false })
            this.solve()
          }}>
          SOLVE
        </Button>
      </Fragment>
    )
  }
}

export default ReadFile
