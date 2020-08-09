require('dotenv').config()
const knex = require('knex')
const NotesService = require('./notes-service')

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

console.log(NotesService.getAllNotes())