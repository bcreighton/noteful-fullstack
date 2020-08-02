import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NotefulContext from '../../../NotefulContext'
import '../Button.css'
import './DeleteBTN.css'

class DeleteBTN extends Component {
  static contextType = NotefulContext;

  deleteNoteRequest() {
    const { id, history } = this.props;

    fetch(`http://localhost:9090/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json'
      },
    })
      .then(res => {
        if (!res.ok) {
          // handle error
          throw new Error(res.status)
        }
        return res.json()
      })
      .then(data => {
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