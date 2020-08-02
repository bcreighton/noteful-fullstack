import React, { Component } from 'react'
import FolderList from '../folderList/FolderList'
import AddFolder from '../buttons/addFolderBTN/AddFolderBTN'
import FolderError from '../FolderError'
import './SideBar.css'

export default class SideBar extends Component {

  render() {

    return (
      <aside className='sideBar'>
        <AddFolder />
        <FolderError>
          <FolderList />
        </FolderError>
      </aside>
    )
  }
}