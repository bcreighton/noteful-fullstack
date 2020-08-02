import React, { Component } from 'react';

class ValidationError extends Component {
  render() {
    if (this.props.message) {
      return (
        <div className="error">{this.props.message}</div>
      );
    }

    return <></>
  }
}

export default ValidationError