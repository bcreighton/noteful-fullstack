import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './ModDate.css'

export default class ModDate extends Component {
  convertDate(date) {

    const y = date.slice(0, 4)
    const m = date.slice(5, 7)
    const d = date.slice(8, 10)

    return `${this.convertDay(d)} ${this.convertMonth(m)} ${y}`
  }

  convertDay(day) {
    return (
      day[0] === '1'
        ? `${day}th`
        : day[0] === '0'
          ? this.singleDigitDay(day)
          : this.doubleDigitDay(day)
    )
  }

  singleDigitDay(day) {
    return (
      day[1] === '1'
        ? '1st'
        : day[1] === '2'
          ? '2nd'
          : day[1] === '3'
            ? '3rd'
            : `${day[1]}th`
    )
  }

  doubleDigitDay(day) {
    return (
      day[1] === '1'
        ? `${day}st`
        : day[1] === '2'
          ? `${day}nd`
          : day[1] === '3'
            ? `${day}rd`
            : `${day}th`
    )
  }

  convertMonth(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    month = parseInt(month)

    return (
      months[month - 1]
    )
  }

  render() {
    if (!this.props.date) {
      return null
    }
    return (
      <p className='modDate'>Date modified on {this.convertDate(this.props.date)}</p>
    )
  }
}

ModDate.propTypes = {
  date: PropTypes.string,
}