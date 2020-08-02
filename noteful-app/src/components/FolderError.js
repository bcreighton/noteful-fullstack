import React, { Component } from 'react'
import GoBack from '../components/buttons/goBack/GoBack'

class FolderError extends Component {
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
    }
  }

  state = {
    hasError: false,
  }

  render() {
    return (
      this.state.hasError
        ? <>
          <h2 className='errorBoundary'>This folder cannot be displayed.</h2>
          <GoBack />
        </>
        : this.props.children
    )
  }
}

export default FolderError;