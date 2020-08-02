import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NotefulContext from '../../NotefulContext'
import NoteListItem from '../noteListItem/NoteListItem'
import AddNoteBTN from '../buttons/addNoteBTN/AddNoteBTN'
import NoteItemError from '../NoteItemError'
import './NoteList.css'

export default class NoteList extends Component {
  static contextType = NotefulContext;

  getNotesById() {
    return this.context.notes.filter(note => {
      return (
        note.folderId === this.props.folderId
      )
    });
  }

  generateNotesList(notes) {
    return notes.map(note => (
      <NoteItemError key={note.id}>
        <NoteListItem
          id={note.id}
          folderId={note.folderId}
          title={note.name}
          modDate={note.modified}
          content={note.content}
        />
      </NoteItemError>
    ))
  }

  render() {

    const noteListItems =
      this.props.folderId === undefined
        ? this.context.notes
        : this.getNotesById()

    return (
      <>
        <AddNoteBTN />
        {this.generateNotesList(noteListItems)}
      </>
    )
  }
}

NoteList.propTypes = {
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
  folderId: PropTypes.string,
}