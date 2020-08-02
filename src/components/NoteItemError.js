import React, { Component } from 'react'

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
          <h2 className='errorBoundary'>This note card cannot be displayed.</h2>
        </>
        : this.props.children
    )
  }
}

export default NoteError;