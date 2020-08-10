const knex = require('knex')

const FoldersService = {
  getAllFolders(knex) {
    return knex.select('*').from('noteful_folders')
  },
}

module.exports = FoldersService