import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NotefulContext from '../../NotefulContext'
import ModDate from '../modDate/ModDate'
import DeleteBTN from '../buttons/delete/DeleteBTN'
import NoteContent from '../noteContent/NoteContent'
import './Note.css'

class Note extends Component {
  static contextType = NotefulContext;

  getNote() {
    return this.context.notes.find(note => note.id.toString() === this.props.match.params.noteId) || {};
  }

  render() {
    const selectedNote = this.getNote()
    debugger

    return (
      <>
        <div className='noteHeader'>
          <h2 className='noteTitle'>{selectedNote.name}</h2>
          <ModDate date={selectedNote.date} />
          <DeleteBTN id={selectedNote.id} history={this.props.history} />
        </div>
        <NoteContent content={selectedNote.content} />
      </>
    )
  }
}

export default Note;

Note.propTypes = {
  context: PropTypes.shape({
    folders: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })),
    notes: PropTypes.arrayOf(PropTypes.shape({
      content: PropTypes.string.isRequired,
      folderId: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      modified: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }))
  }),
  history: PropTypes.object.isRequired,
}