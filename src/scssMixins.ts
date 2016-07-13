/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------*/

'use strict';

import vscode = require('vscode');
import cp = require('child_process');

/**
 * Evaluates whether the selected css properties can be extracted into a mixin.
 * @param activeEditor The current active editor.
 * @returns If valid, formatted css properties that will form the content of the extracted mixin is returned.
 */
export function extractCssPropertiesForMixin(activeEditor: vscode.TextEditor): string {
        var validationError = '';
        if (!activeEditor){
            vscode.window.showErrorMessage("No active editor");
            return;
        }

        if (activeEditor.selections.length > 1){
            vscode.window.showErrorMessage("You need to have a single selection for mixin extraction");
            return;
        }

        if (!activeEditor.document.uri.fsPath.endsWith('.scss')){
            vscode.window.showErrorMessage("Sorry, this command works only on scss files");
            return;
        }

        var mixinContent = activeEditor.document.getText(activeEditor.selection);
        if(mixinContent.indexOf('{') > -1 || mixinContent.indexOf('}') > -1 || !mixinContent.trim()){
            vscode.window.showErrorMessage("Sorry, your selection cannot have the characters { or }");
            return;
        }

        if (mixinContent.indexOf('\\\\') > -1 || mixinContent.indexOf('/*') > -1 || mixinContent.indexOf('*/') > -1){
            vscode.window.showErrorMessage("Looks like the selected content has commments, please remove them and try again");
            return;
        }

        if (!mixinContent.trim().endsWith(';')){
            vscode.window.showErrorMessage("All selected css properties should end with ;");
            return;
        }

        var cssProperties = getCssProperties(mixinContent);
        if (!cssProperties){
            vscode.window.showErrorMessage("Sorry, cannot extract mixin out of current selection");
            return;
        } 

        return `\t${cssProperties.join('\n\t')}\n`;
}

/**
 * Extracts mixin out of current selection and replaces the current selection with a call to the mixin
 * @param activeEditor The current active editor.
 * @param mixinName name for the extracted mixin. 
 */
export function extractMixin(activeEditor: vscode.TextEditor): void{
    var formattedMixinContent = extractCssPropertiesForMixin(activeEditor);
    if (!formattedMixinContent) {
        return;
    }
    let showInputBoxPromise = vscode.window.showInputBox({placeHolder: 'Please enter the name for the extracted mixin'});
    showInputBoxPromise.then((mixinName: string) => {
        if (mixinName && mixinName.trim()){
            activeEditor.edit(editBuilder => {
                editBuilder.replace(activeEditor.selection, `@include ${mixinName}();`);
                editBuilder.insert(new vscode.Position(0,0), `@mixin ${mixinName} {\n${formattedMixinContent}}\n`);
            });
        }
    });     
}

function getCssProperties(mixinContent: string){
    var properties = mixinContent.split(';');
    var formattedProperties = [];
    for (var i = 0; i < properties.length; i++) {
        if (!properties[i].trim()){
            continue;
        }

        // Css Property name and value should be separated by ':'
        var propertyValuePair = properties[i].split(':');
        if (propertyValuePair.length != 2){
            return null;
        }
        var propertyName = propertyValuePair[0].trim();
        var propertyValue = propertyValuePair[1].trim();
        if (propertyName && propertyValue){
            formattedProperties.push(`${propertyName}: ${propertyValue};`)
        }
    }
    return formattedProperties;
}