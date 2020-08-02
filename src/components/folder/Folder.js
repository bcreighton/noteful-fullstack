import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import './Folder.css'

export default class Folder extends Component {

  render() {
    const { id, name } = this.props

    return (
      <NavLink
        to={`/folder/${id}`}
      >
        <div
          id={id}
          className='folder'
        >
          <h2 className='folderName'>{name}</h2>
        </div>
      </NavLink>
    )
  }
}

Folder.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
}