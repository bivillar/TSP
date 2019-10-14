import React, { Fragment } from 'react'
import { Alert } from 'react-bootstrap'

const Result = ({ distance, path, two_op }) => {
  const getPathString = (string, city, index) => {
    if (index < path.length - 1) {
      string += `${city}, `
    } else {
      string += `${city}].`
    }
    return string
  }

  const pathString = path.reduce(getPathString, '[')
  const two_op_path =
    two_op && two_op.path && two_op.path.reduce(getPathString, '[')
  return (
    <Fragment>
      <Alert variant="success">
        <div>Path: {pathString}</div>
        <div className="f4 b">Distance: {Math.round(distance)}</div>
      </Alert>
      {two_op_path && (
        <Alert variant="success">
          <div>Path after two_op: {two_op_path}</div>
          <div className="f4 b">Distance: {Math.round(two_op.totalSize)}</div>
        </Alert>
      )}
    </Fragment>
  )
}

export default Result
