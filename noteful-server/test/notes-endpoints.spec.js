const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures')
const { makeFoldersArray } = require('./folders.fixtures')
const { DB_URL } = require('../src/config')

describe('Notes Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })

        app.set('db', db)
    })

    before(() =>
        db.raw("TRUNCATE TABLE noteful_folders CASCADE")
    )

    afterEach(() =>
        db.raw("TRUNCATE TABLE noteful_folders CASCADE")
    )

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

            beforeEach('Insert folders and notes into db', () => {
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

            beforeEach('test', () => {
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

        context(`Given an XSS attack note`, () => {
            const testFolders = makeFoldersArray()
            const maliciousNote = {
                id: 911,
                name: 'Naughty naughty very naughty <script>alert("xss");</script>',
                content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                folder_id: 1,
            }

            beforeEach(`insert malicious note`, () => {
                return db
                .into('noteful_folders')
                .insert(testFolders)
                .then(() => {
                    return db
                        .into('noteful_notes')
                        .insert([maliciousNote])
                })
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/notes/${maliciousNote.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                        expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                    })
            })
        })
    })

    describe(`POST /notes`, () => {
        context(`Insert note`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach('test', () => {
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
                    .then(postRes =>
                        supertest(app)
                            .get(`/notes/${postRes.body.id}`)
                            .expect(postRes.body)
                    )
            })

            const requiredFields = ['name', 'content', 'folder_id']

            requiredFields.forEach(field => {
                const newNote = {
                    name: 'Test new note name',
                    content: 'Test new note content',
                    folder_id: 1,
                }

                it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                    delete newNote[field]

                    return supertest(app)
                        .post('/notes')
                        .send(newNote)
                        .expect(400, {
                            error: {
                                message: `Missing '${field}' in request body`
                            }
                        })
                })
            })
        })

        context(`Given an XSS attack`, () => {
            const testFolders = makeFoldersArray()

            beforeEach('test', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            const maliciousNote = {
                name: 'Naughty naughty very naughty <script>alert("xss");</script>',
                content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
                folder_id: 1,
            }

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .post(`/notes`)
                    .send(maliciousNote)
                    .expect(res => {
                        expect(res.body.name).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                        expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                        expect(res.body.folder_id).to.eql(maliciousNote.folder_id)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/notes/${res.body.id}`)

                        const expected = new Date().toLocaleString()
                        const actual = new Date(res.body.date).toLocaleString()
                        expect(actual).to.eql(expected)
                    })
            })
        })
    })

    describe(`DELETE /notes`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456789

                return supertest(app)
                    .delete(`/notes/${noteId}`)
                    .expect(404, {
                        error: {
                            message: `Note doesn't exist`
                        }
                    })
            })
        })

        context(`Givent there are notes in the database`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach(`insert folders and notes`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                })
            })

            it(`responds with 204 and removes the note`, () => {
                const idToRemove = 2
                const expectedNotes = testNotes.filter(note => note.id !== idToRemove)

                return supertest(app)
                    .delete(`/notes/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/notes')
                            .expect(expectedNotes)    
                    )
            })
        })
    })
})