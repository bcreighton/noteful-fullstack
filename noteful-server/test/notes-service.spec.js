const NotesService = require('../src/notes-service')
const FoldersService = require('../src/folders-service')
const knex = require('knex')
const { expect } = require('chai')

describe('Notes service object', function () {
  let db
  let testFolders = [
    {
      id: 1,
      "name": "Brassicaceae"
    },
    {
      id: 2,
      "name": "Saxifragaceae"
    },
    {
      id: 3,
      "name": "Cyperaceae"
    },
    {
      id: 4,
      "name": "Onagraceae"
    },
    {
      id: 5,
      "name": "Asteraceae"
    }
  ]

  let testNotes = [
    {
      id: 1,
      "name": "Hooker's Silene",
      "content": "Pellentesque at nulla. Suspendisse potenti. Cras in purus eu magna vulputate luctus.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 2
    },
    {
      id: 2,
      "name": "Woodland Tuftedorchid",
      "content": "In congue. Etiam justo. Etiam pretium iaculis justo.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 4
    },
    {
      id: 3,
      "name": "Miege Clover",
      "content": "Nullam porttitor lacus at turpis. Donec posuere metus vitae ipsum. Aliquam non mauris.\n\nMorbi non lectus. Aliquam sit amet diam in magna bibendum imperdiet. Nullam orci pede, venenatis non, sodales sed, tincidunt eu, felis.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 1
    },
    {
      id: 4,
      "name": "Sneezeweed",
      "content": "Sed ante. Vivamus tortor. Duis mattis egestas metus.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 2
    },
    {
      id: 5,
      "name": "Spurred Butterfly Pea",
      "content": "Quisque id justo sit amet sapien dignissim vestibulum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla dapibus dolor vel est. Donec odio justo, sollicitudin ut, suscipit a, feugiat et, eros.\n\nVestibulum ac est lacinia nisi venenatis tristique. Fusce congue, diam id ornare imperdiet, sapien urna pretium nisl, ut volutpat sapien arcu sed augue. Aliquam erat volutpat.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 1
    },
    {
      id: 6,
      "name": "Cloudforest Magnolia",
      "content": "Duis consequat dui nec nisi volutpat eleifend. Donec ut dolor. Morbi vel lectus in quam fringilla rhoncus.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 5
    },
    {
      id: 7,
      "name": "Del Norte County Iris",
      "content": "Proin leo odio, porttitor id, consequat in, consequat ut, nulla. Sed accumsan felis. Ut at dolor quis odio consequat varius.\n\nInteger ac leo. Pellentesque ultrices mattis odio. Donec vitae nisi.\n\nNam ultrices, libero non mattis pulvinar, nulla pede ullamcorper augue, a suscipit nulla elit ac nulla. Sed vel enim sit amet nunc viverra dapibus. Nulla suscipit ligula in lacus.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 4
    },
    {
      id: 8,
      "name": "Queen Charlotte Island False Rue Anemone",
      "content": "Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 3
    },
    {
      id: 9,
      "name": "Alpine Bulrush",
      "content": "Phasellus sit amet erat. Nulla tempus. Vivamus in felis eu sapien cursus vestibulum.\n\nProin eu mi. Nulla ac enim. In tempor, turpis nec euismod scelerisque, quam turpis adipiscing lorem, vitae mattis nibh ligula nec sem.\n\nDuis aliquam convallis nunc. Proin at turpis a pede posuere nonummy. Integer non velit.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 2
    },
    {
      id: 10,
      "name": "Niihau Lobelia",
      "content": "Nulla ut erat id mauris vulputate elementum. Nullam varius. Nulla facilisi.\n\nCras non velit nec nisi vulputate nonummy. Maecenas tincidunt lacus at velit. Vivamus vel nulla eget eros elementum pellentesque.\n\nQuisque porta volutpat erat. Quisque erat eros, viverra eget, congue eget, semper rutrum, nulla. Nunc purus.",
      "date": new Date('2029-01-22T16:28:32.615Z'),
      "folder_id": 2
    },
  ]

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })

  //remove foreign key constraint temporarily to remove current table data before tests run
  before(() => db.raw("ALTER TABLE noteful_notes DROP CONSTRAINT noteful_notes_folder_id_fkey"))
  before(() => db('noteful_notes').truncate())
  before(() => db('noteful_folders').truncate())
  before(() => db.raw("ALTER TABLE noteful_notes ADD CONSTRAINT noteful_notes_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES noteful_folders(id)"))

  //remove foreign key constraint temporarily to remove current table data to avoid test leak
  afterEach(() => db.raw("ALTER TABLE noteful_notes DROP CONSTRAINT noteful_notes_folder_id_fkey"))
  afterEach(() => db('noteful_notes').truncate())
  afterEach(() => db('noteful_folders').truncate())
  afterEach(() => db.raw("ALTER TABLE noteful_notes ADD CONSTRAINT noteful_notes_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES noteful_folders(id)"))

  after(() => db.destroy())

  context(`Given 'noteful_notes' has data`, () => {
    beforeEach(() => {
      return db
        .into('noteful_folders')
        .insert(testFolders)
        .then(() => {
          return db
            .into('noteful_notes')
            .insert(testNotes)
        })
    })

    it(`getAllNotes() resolves all notes from 'noteful_notes' table`, () => {
      // test that NoteService.getAllNotes gets data
      return NotesService.getAllNotes(db)
        .then(actual => {
          expect(actual).to.eql(testNotes)
        })
    })

    it(`getById() resolves a note by id from 'noteful_notes' table`, () => {
      const thirdId = 3
      const thirdTestNote = testNotes[thirdId - 1]

      return NotesService.getById(db, thirdId)
        .then(actual => {
          expect(actual).to.eql({
            id: thirdId,
            name: thirdTestNote.name,
            content: thirdTestNote.content,
            date: thirdTestNote.date,
            folder_id: thirdTestNote.folder_id
          })
        })
    })

    it(`deleteNote() removes a note by id from 'noteful_notes' table`, () => {
      const noteId = 3

      return NotesService.deleteNote(db, noteId)
        .then(() => NotesService.getAllNotes(db))
        .then(allNotes => {
          // copy the test array without the deleted note

          const expected = testNotes.filter(note => note.id !== noteId)
          expect(allNotes).to.eql(expected)
        })
    })

    it(`updateNote() updates a note from the 'noteful_notes' table`, () => {
      const idOfNoteToUpdate = 3
      const newNoteData = {
        name: 'updated name',
        content: 'updated content',
        date: new Date(),
      }

      return NotesService.updateNote(db, idOfNoteToUpdate, newNoteData)
        .then(() => NotesService.getById(db, idOfNoteToUpdate))
        .then(note => {
          expect(note).to.eql({
            id: idOfNoteToUpdate,
            folder_id: note.folder_id,
            ...newNoteData,
          })
        })
    })

    it(`getAllFolders() resolves all folders from 'noteful_folders' table`, () => {
      // test that NoteService.getAllFolders gets data
      return FoldersService.getAllFolders(db)
        .then(actual => {
          expect(actual).to.eql(testFolders)
        })
    })
  })

  context(`Given 'noteful_notes' has no data`, () => {
    beforeEach(() => {
      return db
        .into('noteful_folders')
        .insert(testFolders)
    })

    it(`getAllNotes() resolves an empty array`, () => {
      return NotesService.getAllNotes(db)
        .then(actual => {
          expect(actual).to.eql([])
        })
    })

    it(`insertNote() inserts a new note and resolves the new note with an 'id'`, () => {
      const newNote = {
        name: 'Test new name',
        content: 'Test new content',
        date: new Date('2029-01-22T16:28:32.615Z'),
        folder_id: 2
      }

      return NotesService.insertNote(db, newNote)
        .then(actual => {
          expect(actual).to.eql({
            id: 1,
            name: newNote.name,
            content: newNote.content,
            date: newNote.date,
            folder_id: newNote.folder_id,
          })
        })
    })
  })
})