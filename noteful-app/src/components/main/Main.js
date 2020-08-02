import React, { Component } from 'react'
import NoteListError from '../NoteListError'
import NoteList from '../noteList/NoteList'
import './Main.css'

class Main extends Component {

  render() {
    return (
      <section className='mainSection'>
        <NoteListError>
          <NoteList folderId={this.props.match.params.folderId} />
        </NoteListError>
      </section>
    )
  }
}

export default Main;