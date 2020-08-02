import React, { Component } from 'react'

class NoteListError extends Component {
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
          <h2 className='errorBoundary'>The note list cannot be displayed; please refresh.</h2>
        </>
        : this.props.children
    )
  }
}

export default NoteListError;