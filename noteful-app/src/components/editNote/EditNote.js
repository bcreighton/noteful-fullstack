import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ValidationError from '../ValidationError'
import NotefulContext from '../../NotefulContext'

const Required = () => {
    <span className='EditFolderRequired'>*</span>
}

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

    ValidateNoteFolder() {
        const noteFolder = this.state.noteFolder.value.trim();

        if (noteFolder.length === 0) {
            return "Please select a folder; it is required";
        }
    }

    ValidateNoteContent() {
        const noteContent = this.state.noteContent.value.trim();

        if (noteContent.length === 0) {
            return "Content is required";
        } else if (noteContent.length < 5) {
            return "Please enter at least 5 characters";
        }
    }

    generateFolderDDList = () => {
        return this.context.folders.map(folder => (
            <option
                key={folder.id}
                value={folder.name}
            >
                {folder.name}
            </option>
        ))
    }

    getFolderName = (noteFolderId) => {
        return this.context.folders.find(folder => {
            return noteFolderId === folder.id
        }).name
    }

    handleSubmit = () => {

    }

    handleClickCancel = () => {
        this.props.history.push('/')
    }

    componentDidMount() {
        const noteId = this.props.match.params.noteId

        fetch(`https://localhost:8000/api/notes/${noteId}`, {
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
                    noteTitle: note.name,
                    noteFolder: note.folder_id,
                    noteContent: note.content,
                })
            })
            .catch(error => this.setState({ error }))
    }

    render() {
        const noteTitleError = this.validateNoteTitle();
        const noteFolderError = this.validateNoteFolder();
        const noteContentError = this.validateNoteContent();
        const { error } = this.state;
        const folderList = this.generateFolderDDList();

        const { noteTitle, noteFolder, noteContent } = this.state

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
                        value={noteTitle}
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
                        selected={this.getFolderName(noteFolder)}
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
                        value={noteContent}
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