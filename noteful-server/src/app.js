require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const NotesService = require('./notes-service')
const FoldersService = require('./folders-service')

const app = express()
const jsonParser = express.json()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

// /notes routes

app.get('/notes', (req, res, next) => {
  const knexInstance = req.app.get('db')

  NotesService.getAllNotes(knexInstance)
    .then(notes => {
      res.json(notes)
    })
    .catch(next)
})

app.get('/notes/:note_id', (req, res, next) => {
  const knexInstance = req.app.get('db')

  NotesService.getById(knexInstance, req.params.note_id)
    .then(note => {
      !note
        ? res.status(404).json({
            error: {
              message: `Note doesn't exist`
            }
          })
        : res.json(note)
    })
    .catch(next)
})

app.post('/notes',jsonParser, (req, res, next) => {
  const knexInstance = req.app.get('db')
  const {name, content, folder_id} = req.body
  const newNote = {name, content, folder_id}

  NotesService.insertNote(knexInstance, newNote)
    .then(note => {
      res
        .status(201)
        .location(`/notes/${note.id}`)
        .json(note)
    })
    .catch(next)
})

// /folder routes

app.get('/folders', (req, res, next) =>  {
  const knexInstance = req.app.get('db')

  FoldersService.getAllFolders(knexInstance)
    .then(folders => {
      res.json(folders)
    })
    .catch(next)
})

app.get('/folders/:folder_id', (req, res, next) => {
  const knexInstance = req.app.get('db')

  FoldersService.getById(knexInstance, req.params.folder_id)
    .then(folder => {
      !folder
        ? res.status(404).json({
            error: {
              message: `Folder doesn't exist`
            }
          })
        : res.json(folder)
    })
    .catch(next)
})

app.get('/', (req, res) => {
  res.send('Hello, Noteful!')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app