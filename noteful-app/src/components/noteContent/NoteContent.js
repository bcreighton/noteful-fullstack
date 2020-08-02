import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './NoteContent.css'

export default class NoteContent extends Component {
  render() {
    return (
      <div className='noteContent'>
        <p>{this.props.content}</p>
      </div>
    )
  }
}

NoteContent.propTypes = {
  content: PropTypes.string,
}