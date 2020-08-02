import React, { Component } from 'react'
import GoBack from '../components/buttons/goBack/GoBack'

class NoteError extends Component {
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
          <h2 className='errorBoundary'>This note cannot be displayed.</h2>
          <GoBack />
        </>
        : this.props.children
    )
  }
}

export default NoteError;