import React, { Component } from 'react'
import { Spinner } from 'react-bootstrap'

const Progress = ({ loading = false, done = false, className = '' }) => {
  let render
  if (loading) render = <Spinner animation="border" variant="warning" />
  if (done)
    render = <i style={{ color: 'green' }} className="fas fa-check-circle"></i>

  return <span className={className}>{render}</span>
}

export default Progress
