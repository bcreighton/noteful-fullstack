import React from 'react'

const NotefulContext = React.createContext({
  notes: {},
  folders: {},
  addNote: () => { },
  addFolder: () => { },
  updateNote: () => { },
  updateFolder: () => { },
  deleteNote: () => { },
  deleteFolder: () => { },
  generateId: () => { },
})

export default NotefulContext
