/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import vscode = require('vscode');
import cp = require('child_process');

/**
 * Replaces selected css in the editor with appropriately nested scss using sass-convert
 * @param activeEditor The current active editor.
 *
 * @returns A Thenable which on success returns null and on error returns error message
 */
export function nestRules(activeEditor: vscode.TextEditor): Thenable<string> {
    return new Promise((resolve, reject) => {
        if (!activeEditor){
            return reject("No active editor");
        }

        if (activeEditor.selections.length > 1){
            return reject("You need to have a single selection for the css to scss conversion to take place");
        }

        if (!activeEditor.document.uri.fsPath.endsWith('.scss')){
            return reject("Sorry, this command works only on scss files");
        }

        var process = cp.exec('sass-convert -f css --to scss', (err, stdout, stderr) => {
            if(err){
                return reject(stderr);
            }
            
            return activeEditor.edit(editBuilder => {
                editBuilder.replace(activeEditor.selection, stdout);
            }).then(validEdit => {
                if (validEdit) {
                    return resolve();
                } else {
                    return reject("Failed to apply edits to the document");
                }
            }, reason => {
                return reject("Failed to apply edits to the document");
            })
        });
        process.stdin.end(activeEditor.document.getText(activeEditor.selection));
    });
}



/**
 * Replaces current selection of properties with same prefix into nested properties. Example: font-family, font-size
 * @param activeEditor The current active editor.
 * @returns A Thenable which on success returns null and on error returns error message
 */
export function nestProperties(activeEditor: vscode.TextEditor): Thenable<string> {
    return new Promise((resolve, reject) => {
        if (!activeEditor){
            return reject("No active editor");
        }

        if (activeEditor.selections.length > 1){
            return reject("You need to have a single selection for the css to scss conversion to take place");
        }

        if (!activeEditor.document.uri.fsPath.endsWith('.scss')){
            return reject("Sorry, this command works only on scss files");
        }

        var propertyValueContent = activeEditor.document.getText(activeEditor.selection);
        if(propertyValueContent.indexOf('{') > -1 || propertyValueContent.indexOf('}') > -1 || !propertyValueContent.trim()){
            return reject("Sorry, cannot nest properties in the current selection");
        }

        var propertyValues = propertyValueContent.split(';');
        var nestedPropertyValues = '';
        var namespaceToExtract = '';        
        var tabsToPrefix = getTabsBeforeSelectionStarts(activeEditor);

        for(var i = 0; i < propertyValues.length; i++){
            var propertyValue = propertyValues[i].trim();
            if (!propertyValue){
                continue;
            }

            // Css Property name and value should be separated by ':'
            var propertyValueSplit =  propertyValue.split(':');
            if (propertyValueSplit.length == 1){
                return reject('Sorry, cannot parse current selection');                
            }

            // Css Property names with namespace have '-'. Example: margin-top, font-size
            var currNamespace = propertyValueSplit[0].split('-');
            if (currNamespace.length == 1){
                return reject('Sorry, cannot parse current selection');      
            }

            if (!namespaceToExtract){
                namespaceToExtract = currNamespace[0];
            } else if (namespaceToExtract !== currNamespace[0]){
                return reject('Sorry, not all selected properties have the same namespace');                
            }
            propertyValue = propertyValue.substr(namespaceToExtract.length + 1);
            nestedPropertyValues += `${tabsToPrefix}\t${propertyValue};\n`
        }

        nestedPropertyValues = `${namespaceToExtract}: {\n${nestedPropertyValues}${tabsToPrefix}}\n`;

        activeEditor.edit(editBuilder => {
            editBuilder.replace(activeEditor.selection, nestedPropertyValues);
        }).then(validEdit => {
            if (validEdit) {
                return resolve();
            } else {
                return reject("Failed to apply edits to the document");
            }
        });
    });
}

function getTabsBeforeSelectionStarts(editor: vscode.TextEditor){
    var range = new vscode.Range(editor.selection.start.line, 0, editor.selection.start.line, editor.selection.start.character);
    var text = editor.document.getText(range);
    
    return text.trim() ? '' : text;
}