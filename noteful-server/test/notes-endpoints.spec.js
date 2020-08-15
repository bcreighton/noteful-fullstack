const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const {makeNotesArray} = require('./notes.fixtures')
const {makeFoldersArray} = require('./folders.fixtures')

describe.only('Notes Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })

        app.set('db', db)
    })

    //remove foreign key constraint temporarily to remove current table data before tests run
    before('remove foreign key constraints', () => db.raw("ALTER TABLE noteful_notes DROP CONSTRAINT noteful_notes_folder_id_fkey"))
    before('clean noteful_notes table', () => db('noteful_notes').truncate())
    before('clean noteful_folders table', () => db('noteful_folders').truncate())
    before('readd foreign key constraints', () => db.raw("ALTER TABLE noteful_notes ADD CONSTRAINT noteful_notes_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES noteful_folders(id)"))

    //remove foreign key constraint temporarily to remove current table data to avoid test leak
    afterEach('remove foreign key constraints',() => db.raw("ALTER TABLE noteful_notes DROP CONSTRAINT noteful_notes_folder_id_fkey"))
    afterEach('clean noteful_notes table', () => db('noteful_notes').truncate())
    afterEach('clean noteful_folders table', () => db('noteful_folders').truncate())
    afterEach('readd foreign key constraints', () => db.raw("ALTER TABLE noteful_notes ADD CONSTRAINT noteful_notes_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES noteful_folders(id)"))

    after('disconnect from db', () => db.destroy())

    describe(`GET /notes`, () => {
        context(`Given no notes`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/notes')
                    .expect(200, [])
            })
        })

        context(`Given there are notes in the db`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()
            
              beforeEach('Insert folders and notes into db',() => {
                  return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
              })
    
              it(`response with 200 and all of the notes`, () => {
                  return supertest(app)
                    .get('/notes')
                    .expect(200, testNotes)
              })
        })
    })

    describe(`GET /notes/:note_id`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 1234567890

                return supertest(app)
                    .get(`/notes/${noteId}`)
                    .expect(404, {
                        error: {
                            message: `Note doesn't exist`
                        }
                    })
            })
        })
        context(`Given there are notes in the database`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()
            
              beforeEach('test',() => {
                  return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
              })

            it(`response wtih 200 and the specified note`, () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]

                return supertest(app)
                .get(`/notes/${noteId}`)
                .expect(200, expectedNote)
            })
        })
    })

    describe(`POST /notes`, () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray()
            
        beforeEach('test',() => {
            return db
            .into('noteful_folders')
            .insert(testFolders)
        })

        it(`creates a note, responding with 201 and the new note`, () => {
            this.retries(3)

            const newNote = {
                name: 'Test new note',
                content: 'Test new note content',
                folder_id: 1,
            }

            return supertest(app)
                .post(`/notes`)
                .send(newNote)
                .expect(res => {
                    expect(res.body.name).to.eql(newNote.name)
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body.folder_id).to.eql(newNote.folder_id)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/notes/${res.body.id}`)
                    
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes=> 
                    supertest(app)
                        .get(`/notes/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })
    })
})