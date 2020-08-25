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

    describe(`GET /api/folders`, () => {
        context(`Given no folders`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get(`/api/folders`)
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
                    .get(`/api/folders`)
                    .expect(200, testFolders)
            })
        })
    })

    describe(`GET /api/folders/:folder_id`, () => {
        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                const folderId = 1234567890

                return supertest(app)
                    .get(`/api/folders/${folderId}`)
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
                    .get(`/api/folders/${folderId}`)
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
                    .get(`/api/folders/${maliciousFolder.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                    })
            })
        })
    })

    describe(`POST /api/folders`, () => {
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
                    .post(`/api/folders`)
                    .send(newFolder)
                    .expect(res => {
                        expect(res.body.name).to.eql(newFolder.name)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                    })
                    .then(postRes =>
                        supertest(app)
                            .get(`/api/folders/${postRes.body.id}`)
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
                    .post(`/api/folders`)
                    .send(maliciousFolder)
                    .expect(res => {
                        expect(res.body.name).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                    })
                    .then(postRes => 
                            supertest(app)
                                .get(`/api/folders/${postRes.body.id}`)
                                .expect(postRes.body)
                        )
            })
        })
        
    })

    describe(`DELETE /api/folders`, () => {
        context(`Given no folders`, () => {
            it(`responds with 400`, () => {
                const folderId = 123456789

                return supertest(app)
                    .delete(`/api/folders/${folderId}`)
                    .expect(404, {
                        error: {
                            message: `Folder doesn't exist`
                        }
                    })
            })
        })

        context(`Given there are notes in teh database`, () => {
            const testFolders = makeFoldersArray()

            beforeEach(`insert folders`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it(`responds with 204 and removes the folder`, () => {
                const idToRemove = 2
                const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/folders/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get(`/api/folders`)
                            .expect(expectedFolders)
                    })
            })
        })
    })

    describe(`PATCH /api/folders/:folder_id`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const folderId = 123456789

                return supertest(app)
                    .patch(`/api/folders/${folderId}`)
                    .expect(404, {
                        error: {
                            message: `Folder doesn't exist`
                        }
                    })
            })
        })

        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray()

            beforeEach(`insert folders`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it(`responds with 204 and updates the folder`, () => {
                const idToUpdate = 2
                const updateFolder = {
                    name: 'updated folder title',
                }
                const expectedFolder = {
                    ...testFolders[idToUpdate - 1],
                    ...updateFolder,
                }

                return supertest(app)
                    .patch(`/api/folders/${idToUpdate}`)
                    .send(updateFolder)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/folders/${idToUpdate}`)
                            .expect(expectedFolder)
                    )
            })
        })
    })
})