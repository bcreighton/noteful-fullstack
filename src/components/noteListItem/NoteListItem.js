import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import ModDate from '../modDate/ModDate'
import DeleteBTN from '../buttons/delete/DeleteBTN'
import './NoteListItem.css'

class NoteListItem extends Component {
  render() {
    const { id, title, modDate } = this.props
    return (
      <div className='noteItem'>
        <Link to={`/note/${id}`} id={id} >
          <div className='note'>
            <h2 className='noteTitle'>{title}</h2>
            <ModDate date={modDate} />
          </div>
        </Link>
        <DeleteBTN id={id} />
      </div>
    )
  }
}

export default NoteListItem;

NoteListItem.propTypes = {
  id: PropTypes.string.isRequired,
  folderId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  modDate: PropTypes.string.isRequired,
  content: PropTypes.string,
}