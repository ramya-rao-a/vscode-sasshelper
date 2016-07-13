'use strict';

import * as vscode from 'vscode';
import cp = require('child_process');
import { convertToScss, convertToSass } from './convertFile';
import { extractMixin } from './scssMixins';
import { nestRules, nestProperties } from './nestCss';

export function activate(context: vscode.ExtensionContext) {
    cp.exec('sass -h', (err, stdout, stderr) => {
        if (err) {
            vscode.window.showInformationMessage('Please install the sass command line tool from http://sass-lang.com/install for few of the features in sass-helper extension to work');
        }
    });

    let d1 = vscode.commands.registerCommand('sass-helper.create-scss-file', (uri?: vscode.Uri) => {
        convertToScss(vscode.window.activeTextEditor, uri).then(() => {
            vscode.window.showInformationMessage("Conversion to scss was successful!")
        }, (errorMessage)=>{
            vscode.window.showErrorMessage(errorMessage);
        });
    });

    let d2 = vscode.commands.registerCommand('sass-helper.create-sass-file', (uri?: vscode.Uri) => {
        convertToSass(vscode.window.activeTextEditor, uri).then(() => {
            vscode.window.showInformationMessage("Conversion to sass was successful!")
        }, (errorMessage)=>{
            vscode.window.showErrorMessage(errorMessage);
        });
    });

    let d3 = vscode.commands.registerCommand('sass-helper.nest-rules', () => {
        nestRules(vscode.window.activeTextEditor).then(null, (errorMessage)=>{
            vscode.window.showErrorMessage(errorMessage);
        });
    });

    let d4 = vscode.commands.registerCommand('sass-helper.extract-mixin', () => {
        extractMixin(vscode.window.activeTextEditor);
    });

    let d5 = vscode.commands.registerCommand('sass-helper.nest-properties', () => {
        nestProperties(vscode.window.activeTextEditor).then(null, (errorMessage)=>{
            vscode.window.showErrorMessage(errorMessage);
        });
    });

    context.subscriptions.push(d1);
    context.subscriptions.push(d2);
    context.subscriptions.push(d3);
    context.subscriptions.push(d4);
    context.subscriptions.push(d5);
}

export function deactivate() {
}
