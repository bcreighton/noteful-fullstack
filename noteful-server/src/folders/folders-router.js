const path = require('path')
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
        return res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json({
              id: folder.id,
              name: xss(folder.name)
          })
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
      FoldersService.getById(
          req.app.get('db'),
          req.params.folder_id
      )
        .then(folder => {
            if(!folder) {
                return res.status(404).json({
                    error: {
                        message: `Folder doesn't exist`
                    }
                })
            }

            res.folder = folder // save the folder for the next middleware
            next() // call next to push to the next middleware
        })
        .catch(next)
  })
  .get((req, res, next) => {
        res.json({
            id: res.folder.id,
            name: xss(res.folder.name)
        })
  })
  .delete((req, res, next) => {
      FoldersService.deleteFolder(
          req.app.get('db'),
          req.params.folder_id
      )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
      const { name } = req.body
      const folderToUpdate = { name }

      FoldersService.updateFolder(
          req.app.get('db'),
          req.params.folder_id,
          folderToUpdate
      )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
  })

module.exports = foldersRouter