import React, { Component } from 'react'
import { CANVAS } from '../constants'

class Canvas extends Component {
  state = {
    ctx: null,
    canvas: null,
  }
  componentDidMount() {
    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    this.setState({ canvas, ctx })
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, CANVAS, CANVAS)
  }

  componentDidUpdate() {
    const { ctx } = this.state
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, CANVAS, CANVAS)
    ctx.fillStyle = 'red'

    this.props.cities.forEach(({ x, y }, index) => {
      ctx.fillStyle = 'red'
      ctx.fillRect(x, y, 5, 5)
      ctx.fillText(`${index} (${x},${y})`, x + 2, y - 2)
    })

    const pathSize = this.props.bestPath.length
    if (pathSize)
      for (let i = 0; i < pathSize; i++) {
        const neighbor = (i + 1) % pathSize
        const from = this.props.cities[this.props.bestPath[i]]
        const to = this.props.cities[this.props.bestPath[neighbor]]
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }
  }

  render() {
    return (
      <div style={{ width: CANVAS, height: CANVAS }}>
        <canvas ref="canvas" width={CANVAS} height={CANVAS} />
      </div>
    )
  }
}

export default Canvas
