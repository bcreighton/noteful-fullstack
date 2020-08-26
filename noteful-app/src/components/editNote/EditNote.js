import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ValidationError from '../ValidationError'
import NotefulContext from '../../NotefulContext'

const Required = () => {
    <span className='AddFolderRequired'>*</span>
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

        if(noteTitle.length === 0) {
            return "Note title is required";
        } else if (noteTitle.length < 3) {
            return "Note title must be at least 3 characters long";
        }
    }

    ValidateNoteFolder() {
        const noteFolder = this.state.noteFolder.value.trim();

        if(noteFolder.length === 0) {
            return "Please select a folder; it is required";
        }
    }

    ValidateNoteContent() {
        const noteContent = this.state.noteContent.value.trim();

        if(noteContent.length === 0) {
            return "Content is required";
        } else if(noteContent.length < 5) {
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

    getFolderId = (noteFolder) => {
        return this.context.folders.find(folder => {
            return noteFolder === folder.name
        }).id
    }

    handleSubmit = () => {

    }

    handleClickCancel = () => {
        this.props.history.push('/')
    }
}