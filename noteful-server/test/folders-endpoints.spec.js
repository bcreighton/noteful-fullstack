const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures')
const { makeFoldersArray } = require('./folders.fixtures')

describe('Folders Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })

        app.set('db', db)
    })

    before(() =>
        db.raw(`TRUNCATE TABLE noteful_folders CASCADE`), (`RESTART IDENTITY`)
    )

    afterEach(() =>
        db.raw(`TRUNCATE TABLE noteful_folders CASCADE`), (`RESTART IDENTITY`)
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

        context(`Given an XSS attack folder`, () => {
            const maliciousFolder = {
                id: 911,
                name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
            }

            beforeEach(`insert malicious folder`, () => {
                return db
                    .into('noteful_folders')
                    .insert([maliciousFolder])
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/folders/${maliciousFolder.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                    })
            })
        })
    })

    describe(`POST /folders`, () => {
        context(`Insert folder`, () => {
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
                    id: 6,
                    name: 'Test new folder',
                }

                return supertest(app)
                    .post(`/folders`)
                    .send(newFolder)
                    .expect(res => {
                        expect(res.body.name).to.eql(newFolder.name)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/folders/${res.body.id}`)
                    })
                    .then(postRes =>
                        supertest(app)
                            .get(`/folders/${postRes.body.id}`)
                            .expect(postRes.body)
                    )
            })
        })

        context(`Given an XSS attack`, () => {
            const maliciousFolder = {
                name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
            }

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .post(`/folders`)
                    .send(maliciousFolder)
                    .expect(res => {
                        expect(res.body.name).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/folders/${res.body.id}`)
                    })
                    .then(postRes => 
                            supertest(app)
                                .get(`/folders/${postRes.body.id}`)
                                .expect(postRes.body)
                        )
            })
        })
        
    })
})