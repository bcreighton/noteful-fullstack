import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../Button.css'
import './AddFolderBTN.css'

export default class AddFolderBTN extends Component {
  render() {
    return (
      <Link to={'/addFolder'} id='addFolderBTN' className='btn addBTN'>Add Folder</Link>
    )
  }
}