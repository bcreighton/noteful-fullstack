import React, { Component } from 'react'
import NotefulContext from '../../NotefulContext'
import Folder from '../folder/Folder'
import './FolderList.css'

class FolderList extends Component {
  static contextType = NotefulContext;

  render() {

    return (
      <>
        {this.context.folders.map(folder => (
          <Folder
            key={folder.id}
            id={folder.id.toString()}
            name={folder.name}
          />
        ))}
      </>
    )
  }
}

export default FolderList