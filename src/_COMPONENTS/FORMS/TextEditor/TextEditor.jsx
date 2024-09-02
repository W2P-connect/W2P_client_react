import React, { useState, useEffect } from 'react';
import { EditorState, Modifier, RichUtils, getDefaultKeyBinding, convertToRaw, ContentState, convertFromHTML } from 'draft-js';
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { stateToHTML } from 'draft-js-export-html';
import './textEditor.css'
import { getSelectedBlock } from "draftjs-utils";

// const TextEditor = () => {
//     const [editorState, setEditorState] = useState(EditorState.createEmpty());

//     const onChange = (newEditorState) => {
//         setEditorState(newEditorState);
//     };

//     const insertVariable = (variable) => {
//         const contentState = editorState.getCurrentContent();
//         const contentStateWithEntity = contentState.createEntity('VARIABLE', 'IMMUTABLE', { variable });
//         const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
//         const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

//         setEditorState(RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey));
//     };

//     const entityDecorator = (contentBlock, callback, contentState) => {
//         contentBlock.findEntityRanges(
//             (character) => {
//                 const entityKey = character.getEntity();
//                 return entityKey !== null && contentState.getEntity(entityKey).getType() === 'VARIABLE';
//             },
//             callback
//         );
//     };

//     const VariableComponent = ({ contentState, entityKey, children }) => {
//         const { variable } = contentState.getEntity(entityKey).getData();
//         return <span style={{ color: 'blue' }}>{variable}</span>;
//     };

//     return (
//         <div>
//             <button type="button" onClick={() => insertVariable('Order number {{order_id}}')}>Insert Variable</button>
//             <Editor
//                 editorState={editorState}
//                 onChange={onChange}
//                 customDecorators={[{ strategy: entityDecorator, component: VariableComponent }]}
//             />
//         </div>
//     );
// };

// export default TextEditor;



/**
 * 
 * @param {string} value state de la valeur de l'éditeur
 * @param {Function} onChange Pour mettre à jour la valeur du state lors de l'édition.
 * @returns 
 */
export default function TextEditor({ value = '', setter, customParameters = [], placeholder = '' }) {

    const [editorState, setEditorState] = useState(() => {
        const contentState = ContentState.createFromBlockArray(
            convertFromHTML(value)
        );
        return EditorState.createWithContent(contentState);
    });

    const onEditorStateChange = function (editorState) {
        setEditorState(editorState);
        const htmlContent = stateToHTML(editorState.getCurrentContent());
        setter && setter(...customParameters, htmlContent);
    };


    // const onHandleKeyBindings = (e) => {
    //     if (e.keyCode === 9) {
    //         setEditorState(RichUtils.onTab(e, editorState, 4));
    //     } else {
    //         return getDefaultKeyBinding(e);
    //     }
    // };

    const insertVariable = (variable) => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('VARIABLE', 'IMMUTABLE', { variable });       
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.push(editorState, contentStateWithEntity, 'insert-characters');

        setEditorState(RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey));
    };

    const VariableComponent = ({ contentState, entityKey, children }) => {
        const { variable } = contentState.getEntity(entityKey).getData();
        return <span style={{ color: 'blue' }}>{variable}</span>;
    };

    const entityDecorator = (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity();
                return entityKey !== null && contentState.getEntity(entityKey).getType() === 'VARIABLE';
            },
            callback
        );
    };

    const toolbarOptions = {
        // options: ['inline', 'list'],
        options: [],
        inline: {
            options: ['bold', 'italic', 'underline'],
        },
        list: {
            options: ['unordered', 'ordered'],
        },
    };

    return (
        <>
            <Editor
                // toolbarOnFocus
                toolbar={toolbarOptions}
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                customDecorators={[{ strategy: entityDecorator, component: VariableComponent }]}
                // onTab={onHandleKeyBindings}
                placeholder={placeholder}
            />
        </>

    )

}


