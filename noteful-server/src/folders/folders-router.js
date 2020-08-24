const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

foldersRouter
  .route('/')
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders)
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { id, name } = req.body
    const newFolder = { id, name }

    FoldersService.insertFolder(req.app.get('db'), newFolder)
      .then(folder => {
        debugger
        return res
          .status(201)
          .location(`/folders/${folder.id}`)
          .json(folder)
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .get((req, res, next) => {
    FoldersService.getById(req.app.get('db'), req.params.folder_id)
      .then(folder => {
        !folder
          ? res.status(404).json({
            error: {
              message: `Folder doesn't exist`
            }
          })
          : res.json({
              id: folder.id,
              name: xss(folder.name)
          })
      })
      .catch(next)
  })

module.exports = foldersRouter