const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, content, folder_id } = req.body
    const newNote = { name, content, folder_id }

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: {
            message: `Missing '${key}' in request body`
          }
        })
      }
    }

    NotesService.insertNote(req.app.get('db'), newNote)
      .then(note => {
        res
          .status(201)
          .location(`/notes/${note.id}`)
          .json(note)
      })
      .catch(next)
  })

notesRouter
  .route('/:note_id')
  .get((req, res, next) => {
    NotesService.getById(req.app.get('db'), req.params.note_id)
      .then(note => {
        !note
          ? res.status(404).json({
            error: {
              message: `Note doesn't exist`
            }
          })
          : res.json({
              id: note.id,
              name: xss(note.name),
              content: xss(note.content),
              folder_id: note.folder_id,
              date: note.date,
          })
      })
      .catch(next)
  })

module.exports = notesRouter