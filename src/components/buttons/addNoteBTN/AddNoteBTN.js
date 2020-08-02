import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../Button.css'
import './AddNoteBTN.css'

class AddNoteBTN extends Component {
  render() {
    return (
      <Link
        to={'/addNote'}
        id='addNoteBTN'
        className='btn addBTN'
      >
        Add Note
      </Link>
    )
  }
}

export default AddNoteBTN