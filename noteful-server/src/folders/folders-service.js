const knex = require('knex')

const FoldersService = {
  getAllFolders(knex) {
    return knex.select('*').from('noteful_folders')
  },

  insertFolder(knex, newFolder) {
    debugger
    return knex
      .insert(newFolder)
      .into('noteful_folders')
      .returning('*')
      .then(rows => {
        debugger
        return rows[0]
      })
  },

  getById(knex, id) {
    return knex
      .from('noteful_folders')
      .select('*')
      .where('id', id)
      .first()
  },

  deleteFolder(knex, id) {
    // due to foreign constraint the notes within the folder being deleted must be deleted first 
    return knex('noteful_notes')
      .where('folder_id', id)
      .delete()
      .then(() => {
        return knex('noteful_folders')
          .where({ id })
          .delete()
      })
  },

  updateFolder(knex, id, newFolderFields) {
    return knex('noteful_folders')
      .where({ id })
      .update(newFolderFields)
  }
}

module.exports = FoldersService