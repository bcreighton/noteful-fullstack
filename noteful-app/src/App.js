import React, { Component } from 'react';
import { Route } from 'react-router-dom'
import Header from './components/header/Header'
import Main from './components/main/Main'
import SideBar from './components/sideBar/SideBar'
import SideBarActiveNote from './components/sideBarActiveNote/SideBarActiveNote'
import Note from './components/note/Note'
import AddFolder from './components/addFolder/AddFolder'
import AddNote from './components/addNote/AddNote'
import './App.css';
import NotefulContext from './NotefulContext';
import NoteError from './components/NoteError';

export default class App extends Component {
  state = {
    notes: [],
    folders: [],
    error: null,
  }

  setFolders = folders => {
    this.setState({
      folders,
      error: null,
    })
  }

  setNotes = notes => {
    this.setState({
      notes,
      error: null,
    })
  }

  getFolders() {
    fetch('http://localhost:9090/folders')
      .then(res => {
        if (!res.ok) {
          throw new Error(res.status)
        }
        return res.json()
      })
      .then(this.setFolders)
      .catch(error => this.setState({ error }))
  }

  getNotes() {
    fetch('http://localhost:9090/notes')
      .then(res => {
        if (!res.ok) {
          throw new Error(res.status)
        }
        return res.json()
      })
      .then(this.setNotes)
      .catch(error => this.setState({ error }))
  }

  componentDidMount() {
    this.getFolders()
    this.getNotes()
  }

  addFolder = folder => {
    this.setState({
      folders: [...this.state.folders, folder]
    })
  }

  addNote = note => {
    this.setState({
      notes: [...this.state.notes, note]
    })
  }

  deleteNote = (noteId, history) => {
    // Remove note with the noteId from state
    const newNotes = this.state.notes.filter(
      note => note.id !== noteId
    )
    history !== undefined && history.push('/')
    this.setState({
      notes: newNotes,
    })
  }

  deleteFolder = () => {

  }

  updateFolder = () => {

  }

  updateNote = () => {

  }

  generateId() {
    String.prototype.splice = function (idx, rem, str) {
      return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
    };

    let s = '';
    let id = '';

    for (let i = 0; i < 3; i++) {
      s += Math.random().toString(36).slice(2);
    }
    for (let n = 0; n < s.length; n++) {
      if (n === 8) {
        id = s.splice(n, 0, '-');
      } else if (n === 14) {
        id = id.splice(n, 0, '-');
      } else if (n === 19) {
        id = id.splice(n, 0, '-');
      } else if (n === 26) {
        id = id.splice(n, 0, '-');
      }
    }
    return id;
  }

  renderSideBarRoutes() {
    return (
      <>
        {['/', '/folder/:folderId', '/addFolder', '/addNote'].map(path => (
          <Route
            exact
            key={path}
            path={path}
            component={SideBar}
          />
        )
        )}
        <Route
          path='/note/:noteId'
          component={SideBarActiveNote}
        />
      </>
    )
  }

  renderMainRoutes() {
    return (
      <>
        {['/', '/folder/:folderId'].map(path => (
          <Route
            exact
            key={path}
            path={path}
            component={Main}
          />
        )
        )}
        <Route
          path='/note/:noteId'
          render={(props) => (
            <NoteError>
              <Note {...props} />
            </NoteError>
          )}
        />

        <Route
          path='/addFolder'
          component={AddFolder}
        />

        <Route
          path='/addNote'
          component={AddNote}
        />
        
        <Route 
          path='/edit/:noteId'
          componenet={EditNote}
        />

      </>
    )
  }

  render() {
    const { notes, folders } = this.state

    const contextValue = {
      notes,
      folders,
      generateId: this.generateId,
      addFolder: this.addFolder,
      addNote: this.addNote,
      deleteFolder: this.deleteFolder,
      deleteNote: this.deleteNote,
      updateFolder: this.updateFolder,
      updateNote: this.updateNote,
    }

    const className =
      this.props.match === undefined
        ? 'mainContainer'
        : this.props.match.path === '/note/:noteId'
          ? 'mainContainer activeNote'
          : 'mainContainer'

    return (
      <NotefulContext.Provider value={contextValue}>
        <div className="App">
          <header className="header">
            <Header />
          </header>

          <main className={className}>
            {this.renderMainRoutes()}
            {this.renderSideBarRoutes()}
          </main>
        </div>
      </NotefulContext.Provider>
    )
  }
}
