import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import App from './App';
import Main from './components/main/Main'
import SideBar from './components/sideBar/SideBar'
import SideBarActiveNote from './components/sideBarActiveNote/SideBarActiveNote'
import Note from './components/note/Note'

class Routes extends Component {
  render() {
    return (
      <Route exact path='/' components={App}>
        <Route exact path='/' components={{ main: Main, sideBar: SideBar }} />
        <Route path='folder/:folderId' components={{ main: Main, sideBar: SideBar }} />
        <Route path='note/noteId' components={{ main: Note, sideBar: SideBarActiveNote }} />
      </Route>
    )
  }
}

export default Routes