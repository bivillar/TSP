import React, { Component } from 'react'
import { Form, Button } from 'react-bootstrap'

import { types, CANVAS } from '../constants'
import GeneticAlgorithm from '../algorithms/Genetic'
import Canvas from './Canvas'
import Result from './Result'
import FarthestInsertion from '../algorithms/FarthestInsertion'

class Random extends Component {
  constructor(props) {
    super(props)
    this.state = {
      numberOfCities: 4,
      points: [],
      distances: [],
      showResult: false,
      bestPathEver: [],
      distance: 0,
      getType: props.getType,
      shuffle: true,
    }
  }

  randomNumbers = event => {
    event.preventDefault()
    let points, distances

    if (this.state.shuffle || this.state.points === []) {
      const random = this.getRandomPoints()
      points = random.points
      distances = random.distances
      this.setState({ points, distances })
    } else {
      distances = this.state.distances
    }

    const file = {
      name: 'Random',
      dimension: this.state.numberOfCities,
      edge_weight_format: types.LOWER_DIAG_ROW,
      distances: distances,
    }

    let results
    if (this.state.getType() == 'Genetic') results = this.geneticAlg(file)
    else results = this.farthestInsertion(file)

    this.setState({ ...results })
  }

  getRandomPoints = () => {
    const points = []
    for (let i = 0; i < this.state.numberOfCities; i++) {
      points.push({
        x: Math.floor(Math.random() * CANVAS),
        y: Math.floor(Math.random() * CANVAS),
      })
    }

    let distances = [[]]
    for (let i = 0; i < this.state.numberOfCities; i++) {
      distances[i] = []
      for (let j = 0; j < i + 1; j++) {
        var a = points[i].x - points[j].x
        var b = points[i].y - points[j].y

        distances[i][j] = Math.sqrt(a * a + b * b)
      }
    }
    return { points, distances }
  }

  farthestInsertion = file => {
    const fi = new FarthestInsertion(file)
    fi.findSmallestPath()

    return {
      bestPathEver: fi.best.pathEver,
      distance: fi.best.distance,
      showResult: true,
    }
  }

  geneticAlg = file => {
    const ga = new GeneticAlgorithm(file)
    ga.findSmallestPath()

    return {
      bestPathEver: ga.best.pathEver,
      distance: ga.best.distance,
      showResult: true,
    }
  }

  handleChange = event => {
    event.preventDefault()
    this.setState({ showResult: false })
    this.setState({
      numberOfCities: Number(event.target.value),
      shuffle: true,
    })
  }

  handleCheckChange = event => {
    this.setState({
      shuffle: !event.target.checked,
    })
  }

  render() {
    const {
      numberOfCities,
      points,
      showResult,
      bestPathEver,
      distance,
    } = this.state

    if (showResult) {
      console.log('BEST', this.state.distance, this.state.bestPathEver)
    }

    return (
      <div className="container flex flex-column items-center">
        {showResult ? (
          <Result distance={distance} path={bestPathEver} />
        ) : (
          <div style={{ height: 63 }} />
        )}

        <Canvas cities={points} bestPath={bestPathEver} />

        <Form onSubmit={this.randomNumbers}>
          <Form.Group className="">
            <Form.Label>Choose the number of cities:</Form.Label>
            <div className="flex items-center justify-center mb3">
              <Form.Control
                type="text"
                value={numberOfCities}
                onChange={this.handleChange}
                className="w-20 mr3"
              />
              <Form.Check
                label="Keep points"
                checked={!this.state.shuffle}
                disabled={points.length === 0}
                onChange={this.handleCheckChange}
              />
            </div>
            <div>
              <Button variant="info" type="submit">
                Calculate
              </Button>
            </div>
          </Form.Group>
        </Form>
      </div>
    )
  }
}

export default Random
