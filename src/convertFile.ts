/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import vscode = require('vscode');
import cp = require('child_process');

/**
 * Creates a .scss file by running sass-convert on given .css/.sass file
 * @param activeEditor The current active editor. Will be used to get document uri if no uri is provided.
 * @param uri Uri of the .css file that needs be converted to scss. If none is provided, uri of the document in the active editor is used.
 *
 * @returns A Thenable which on success returns null and on error returns error message
 */
export function convertToScss(activeEditor: vscode.TextEditor, uri?: vscode.Uri): Thenable<string> {
    return convertCssTo(activeEditor, 'scss', uri);
}

/**
 * Creates a .sass file by running sass-convert on given .css/.scss file
 * @param activeEditor The current active editor. Will be used to get document uri if no uri is provided.
 * @param uri Uri of the .css file that needs be converted to sass. If none is provided, uri of the document in the active editor is used.
 *
 * @returns A Thenable which on success returns null and on error returns error message
 */
export function convertToSass(activeEditor: vscode.TextEditor, uri?: vscode.Uri): Thenable<string> {
    return convertCssTo(activeEditor, 'sass', uri);
}

function convertCssTo(activeEditor: vscode.TextEditor, toFormat: string, uri?: vscode.Uri): Thenable<string> {
    return new Promise((resolve, reject) => {
        if (toFormat !== 'scss' && toFormat !== 'sass') {
            return reject('Internal Error');
        }

        // Uri gets passed from the context menus. If none is found, then the command is invoked from command palette.
        if (!uri){
            if (!activeEditor){
                return reject("No active editor");
            }
            uri = activeEditor.document.uri;
        }

        // Figure out the fromFormat from the file extension
        var fromFormat = '';
        if (uri.fsPath.endsWith('.css')){
            fromFormat = 'css';
        } else if (uri.fsPath.endsWith('.scss')) {
            fromFormat = 'scss'
        } 

        // We support only css->scss, css->sass and scss->sass conversions
        if (toFormat === 'scss' && fromFormat !== 'css'){
            return reject("Sorry, this command works only on css files");
        }        
        if (toFormat === 'sass' && fromFormat !== 'css' && fromFormat !== 'scss'){
            return reject("Sorry, this command works only on css or scss files");
        }        

        // If the file to be converted has unsaved changes, prompt the user to save the file first.
        if(activeEditor && activeEditor.document.isDirty && uri.fsPath === activeEditor.document.uri.fsPath){
            return reject("Save the file before attempting conversion to scss/sass");
        }

        var inputFile = uri.fsPath;
        var outputFile = `${uri.fsPath.substr(0, uri.fsPath.length - fromFormat.length)}${toFormat}`;
        var command = `sass-convert --to ${toFormat} ${inputFile} ${outputFile}`;
        cp.exec(command, (err, stdout, stderr) => {
            return err ? reject(stderr): resolve();
        });
    });
}