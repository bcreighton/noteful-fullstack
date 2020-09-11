import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NotefulContext from '../../../NotefulContext'
import '../Button.css'
import './DeleteBTN.css'
import config from '../../../config'

class DeleteBTN extends Component {
  static contextType = NotefulContext;

  deleteNoteRequest() {
    const { id, history } = this.props;

    fetch(config.API_ENDPOINT + `notes/${id}`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json'
      },
    })
      .then(res => {
        if(!res.ok)
          return res.json()
              .then(error => Promise.reject(error))
      })
      .then(() => {
        this.context.deleteNote(id, history)
        history.push('/')
      })
      .catch(error => {
        this.setState({
          error,
        })
      })
  }

  render() {

    return (
      <button
        id='delete'
        className='btn deleteBTN'
        onClick={() => {
          this.deleteNoteRequest()
        }}
      >
        Delete
      </button>
    )
  }
}

export default DeleteBTN

DeleteBTN.propTypes = {
  id: PropTypes.string,
  history: PropTypes.object,
}