import React, { Component } from 'react'

import './App.css'

import { sendFile } from './utils/api'
import { Jumbotron, Form } from 'react-bootstrap'
import ReadFile from './components/ReadFile'
import Random from './components/Random'

class App extends Component {
  state = {
    type: 'Genetic',
  }

  handleRadioChange = event => {
    this.setState({
      type: event.target.value,
    })
  }

  getType = () => this.state.type

  render() {
    return (
      <div className="bg-blue-app f6 h-100 fc">
        <div className="App container">
          <Jumbotron className="w-100">
            <h1 className="w-100 ">Travelling Sallesman Problem</h1>

            <Form>
              <Form.Group className="f4">
                <div className="flex items-center justify-center">
                  <Form.Check
                    type="radio"
                    label="Farthest Insertion"
                    value="Farthest"
                    name="typeOfSearch"
                    checked={this.state.type === 'Farthest'}
                    onChange={this.handleRadioChange}
                    className="mr3"
                  />
                  <Form.Check
                    type="radio"
                    label="Genetic"
                    value="Genetic"
                    name="typeOfSearch"
                    checked={this.state.type === 'Genetic'}
                    onChange={this.handleRadioChange}
                  />
                </div>
              </Form.Group>
            </Form>
          </Jumbotron>
          <div className="flex flex-row-ns flex-column-s w-100 washed-green">
            <div className="w-50-m w-100-s container mb0-ns mb5-s">
              <ReadFile getType={() => this.getType()} />
            </div>
            <div className="w-50-m w-100-s container">
              <Random getType={() => this.getType()} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
