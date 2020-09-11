import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ValidationError from '../ValidationError'
import NotefulContext from '../../NotefulContext'
import config from '../../config'

const Required = () => (
    <span className='EditFolderRequired'>*</span>
)

class EditNote extends Component {

    static contextType = NotefulContext;

    state = {
        error: null,
        noteTitle: {
            value: '',
            touched: false,
        },
        noteFolder: {
            value: '',
            touched: false,
        },
        noteContent: {
            value: '',
            touched: false,
        },
    }

    updateNoteTitle(title) {
        this.setState({
            noteTitle: {
                value: title,
                touched: true,
            }
        })
    }

    updateNoteFolder(folder) {
        this.setState({
            noteFolder: {
                value: folder,
                touched: true,
            }
        })
    }

    updateNoteContent(content) {
        this.setState({
            noteContent: {
                value: content,
                touched: true,
            }
        })
    }

    validateNoteTitle() {
        const noteTitle = this.state.noteTitle.value.trim();

        if (noteTitle.length === 0) {
            return "Note title is required";
        } else if (noteTitle.length < 3) {
            return "Note title must be at least 3 characters long";
        }
    }

    validateNoteFolder() {
        const noteFolder = this.state.noteFolder.value.trim();

        if (noteFolder.length === 0) {
            return "Please select a folder; it is required";
        }
    }

    validateNoteContent() {
        const noteContent = this.state.noteContent.value.trim();

        if (noteContent.length === 0) {
            return "Content is required";
        } else if (noteContent.length < 5) {
            return "Please enter at least 5 characters";
        }
    }

    generateFolderDDList = (selectedFolder) => {
        return this.context.folders.map(folder => (
            folder.name === selectedFolder
                ? <option
                      key={folder.id}
                      value={folder.name}
                      selected
                  >
                      {folder.name}
                  </option>
                : <option
                      key={folder.id}
                      value={folder.name}
                  >
                      {folder.name}
                  </option>
        ))
    }

    getFolderName = (FolderId) => {
        return this.context.folders.find(folder => {
            return FolderId === folder.id
        }).name
    }

    getFolderId = (noteFolder) => {
        return this.context.folders.find(folder => {
            return noteFolder === folder.name
        }).id.toString()
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const { noteTitle, noteFolder, noteContent} = e.target
        const updatedNote = {
            name: noteTitle.value,
            content: noteContent.value,
            folder_id: this.getFolderId(noteFolder.value)
        }

        fetch(config.API_ENDPOINT + `notes/${this.props.match.params.noteId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedNote)
        })
            .then(res => {
                if(!res.ok)
                return res.json()
                    .then(error => Promise.reject(error))
            })
            .then(() => {
                this.context.updateNote(updatedNote)
                this.props.history.push('/')
            })
            .catch(error => this.setState({error}))
    }

    handleClickCancel = () => {
        this.props.history.push('/')
    }

    componentDidMount() {
        const noteId = this.props.match.params.noteId

        fetch(config.API_ENDPOINT + `notes/${noteId}`, {
            method: 'GET'
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(res.status)
                }

                return res.json()
            })
            .then(note => {
                this.setState({
                    noteTitle: {
                        value: note.name,
                        touched: true,
                    },
                    noteFolder: {
                        value: this.getFolderName(note.folder_id),
                        touched: true,
                    },
                    noteContent: {
                        value: note.content,
                        touched: true,
                    },
                })
            })
            .catch(error => this.setState({ error }))
    }

    render() {
        const noteTitleError = this.validateNoteTitle();
        const noteFolderError = this.validateNoteFolder();
        const noteContentError = this.validateNoteContent();
        const { error } = this.state;
        const { noteTitle, noteFolder, noteContent } = this.state;
        const folderList = this.generateFolderDDList(noteFolder.value);

        return (
            <form
                className='EditNoteForm'
                onSubmit={this.handleSubmit}
            >
                <div className='EditNoteError' role='alert'>
                    {error && <p>{error.message}</p>}
                </div>
                <div>
                    <label htmlFor='noteTitle'>
                        Note Title
                  {' '}
                        <Required />
                    </label>
                    <input
                        type='text'
                        name='noteTitle'
                        id='noteTitle'
                        placeholder='Enter note title'
                        onChange={e => this.updateNoteTitle(e.target.value)}
                        required
                        value={noteTitle.value}
                    />
                    {this.state.noteTitle.touched && (
                        <ValidationError message={noteTitleError} />
                    )}
                </div>
                <div>
                    <label htmlFor='noteFolder'>
                        Note Folder
                  {' '}
                        <Required />
                    </label>
                    <select
                        id='noteFolder'
                        name='noteFolder'
                        onChange={e => this.updateNoteFolder(e.target.value)}
                        required
                        selected={noteFolder.value}
                    >
                        {folderList}
                    </select>
                    {this.state.noteFolder.touched && (
                        <ValidationError message={noteFolderError} />
                    )}
                </div>
                <div>
                    <label htmlFor='noteContent'>
                        Content
                  {' '}
                        <Required />
                    </label>
                    <textarea
                        name='noteContent'
                        id='noteContent'
                        placeholder="Enter your note content here..."
                        onChange={e => this.updateNoteContent(e.target.value)}
                        required
                        value={noteContent.value}
                    ></textarea>
                    {this.state.noteContent.touched && (
                        <ValidationError message={noteContentError} />
                    )}
                </div>
                <div className='EditNoteButtons'>
                    <button type='button' onClick={this.handleClickCancel}>
                        Cancel
                </button>
                    {' '}
                    <button type='submit'>
                        Save
                </button>
                </div>
            </form>
        )
    }
}

export default EditNote;

EditNote.propTypes = {
    history: PropTypes.object.isRequired,
}