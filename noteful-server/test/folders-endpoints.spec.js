const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures')
const { makeFoldersArray } = require('./folders.fixtures')

describe.only('Folders Endpoints', function () {
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

    describe(`GET /folders`, () => {
        context(`Given no folders`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get(`/folders`)
                    .expect(200, [])
            })
        })

        context(`Given there are folders in the db`, () => {
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

            it(`responds with 200 and all the folders`, () => {
                return supertest(app)
                    .get(`/folders`)
                    .expect(200, testFolders)
            })
        })
    })

    describe(`GET /folders/:folder_id`, () => {
        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                const folderId = 1234567890

                return supertest(app)
                    .get(`/folders/${folderId}`)
                    .expect(404, {
                        error: {
                            message: `Folder doesn't exist`
                        }
                    })
            })
        })

        context(`Given there are folders in the db`, () => {
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

            it(`responds with 200 and the specific folder`, () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]

                return supertest(app)
                    .get(`/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })
        })
    })

    describe(`POST /folders`, () => {
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

        it(`creates a folder, responding with 201 and the new folder`, () => {
            const newFolder = {
                name: 'Test new folder',
            }

            return supertest(app)
                .post(`/folders`)
                .send(newFolder)
                .expect(201)
        })
    })
})