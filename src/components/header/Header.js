import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

export default class Header extends Component {
  render() {
    return (
      <Link to='/'>
        <h1 className='appTitle'>Noteful</h1>
      </Link>
    )
  }
}