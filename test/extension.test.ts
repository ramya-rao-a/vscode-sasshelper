//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import * as fs from 'fs';
import {convertToScss, convertToSass} from '../src/convertFile'
import {nestRules, nestProperties} from '../src/nestCss'


// Defines a Mocha test suite to group tests of similar kind together
suite("Sass Helper Tests", () => {
    
    let noActiveEditorMessage = "No active editor";

    test("Convert css to Sass/Scss via uri", (done) => {
        let directory = path.join(__dirname, '..','..', 'test', 'testData', 'convertFile');
        let inputfile = path.join(directory, 'test-input.css');
        let uri = vscode.Uri.file(inputfile);
      
        let expectedScssOutputFile = path.join(directory, 'expected-scss-output.scss');
        let expectedScssOutputPromise = new Promise((resolve, reject) => {
            fs.readFile(expectedScssOutputFile, 'utf-8', (err, data) => {
                return resolve(data);
            });
        });

        let expectedSassOutputFile = path.join(directory, 'expected-sass-output.sass');
        let expectedSassOutputPromise = new Promise((resolve, reject) => {
            fs.readFile(expectedSassOutputFile, 'utf-8', (err, data) => {
                return resolve(data);
            });
        });

        let actualScssOutputFile = path.join(directory, 'test-input.scss');
        let actualScssOutputPromise = new Promise((resolve, reject) => {
            return convertToScss(null, uri).then(() => {                
                return fs.readFile(actualScssOutputFile, 'utf-8', (err, data) => {
                    return resolve(data);
                });
            });
        });

        let actualSassOutputFile = path.join(directory, 'test-input.sass');
        let actualSassOutputPromise = new Promise((resolve, reject) => {
            return convertToSass(null, uri).then(() => {                
                return fs.readFile(actualSassOutputFile, 'utf-8', (err, data) => {
                    return resolve(data);
                });
            });
        });

        Promise.all([actualScssOutputPromise, expectedScssOutputPromise, actualSassOutputPromise, expectedSassOutputPromise]).then(values => {
            assert.equal(values[0], values[1]);
            assert.equal(values[2], values[3]);
        }, () => {
            assert.fail();
        }).then(() => done(), done);                
    });

    test("Fail to Convert css to Sass/Scss when unsaved", (done) => {
        let directory = path.join(__dirname, '..','..', 'test', 'testData', 'convertFile');
        let inputfile = path.join(directory, 'test-input.css');
        let uri = vscode.Uri.file(inputfile);

        vscode.workspace.openTextDocument(uri).then(textDocument => {
            return vscode.window.showTextDocument(textDocument).then(editor => {
                return editor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0,0), '\/\/ This is a comment');
                }).then(validEdit => {
                    //Now we have a unsaved document
                    assert.equal(editor.document.isDirty, true);     
                    return convertToSass(editor, uri).then(()=>{
                        assert.fail(); // ConvertToSass should have returned a rejected Promise
                        return Promise.resolve();
                    }, (errorMessage) => {
                        assert.equal(errorMessage, "Save the file before attempting conversion to scss/sass");
                        return Promise.resolve();
                    });;
                })
            });
            
        }).then(()=> done(), done);
    });

    test("Convert to sass/scss fails on non css files", (done) => {
        let directory = path.join(__dirname, '..','..', 'test');
        let inputfile = path.join(directory, 'extension.test.ts');
        let uri = vscode.Uri.file(inputfile);

        var convertToScssPromise = convertToScss(null, uri).then(() => {                
            assert.fail(); // ConvertToScss should have returned a rejected Promise
            return Promise.resolve();
        }, (errorMessage) => {
            assert.equal(errorMessage, "Sorry, this command works only on css files");
            return Promise.resolve();
        });

        var convertToSassPromise = convertToSass(null, uri).then(() => {                
            assert.fail(); // ConvertToSass should have returned a rejected Promise
            return Promise.resolve();
        }, (errorMessage) => {
            assert.equal(errorMessage, "Sorry, this command works only on css or scss files");
            return Promise.resolve();
        });

        Promise.all([convertToSassPromise, convertToScssPromise]).then((values)=> done(), done);
    });

    test("Convert to sass/scss fails on empty editor when no uri is given", (done) => {
        var convertToScssPromise = convertToScss(null, null).then(() => {                
            assert.fail(); // ConvertToScss should have returned a rejected Promise
            return Promise.resolve();
        }, (errorMessage) => {
            assert.equal(errorMessage, noActiveEditorMessage);
            return Promise.resolve();
        });

        var convertToSassPromise = convertToSass(null, null).then(() => {                
            assert.fail(); // ConvertToSass should have returned a rejected Promise
            return Promise.resolve();
        }, (errorMessage) => {
            assert.equal(errorMessage, noActiveEditorMessage);
            return Promise.resolve();
        });

        Promise.all([convertToSassPromise, convertToScssPromise]).then((values)=> done(), done);
    });

    test("Nesting css fails on empty editor", (done) => {
        var nestRulesPromise = nestRules(null).then(() => {                
            assert.fail(); // nestRules should have returned a rejected Promise
            return Promise.resolve();
        }, (errorMessage) => {
            assert.equal(errorMessage, noActiveEditorMessage);
            return Promise.resolve();
        });

        var nestPropertiesPromise = nestProperties(null).then(() => {                
            assert.fail(); // nestProperties should have returned a rejected Promise
            return Promise.resolve();
        }, (errorMessage) => {
            assert.equal(errorMessage, noActiveEditorMessage);
            return Promise.resolve();
        });

        Promise.all([nestRulesPromise, nestPropertiesPromise]).then((values)=> done(), done);
    });

    test("Nesting css fails on non scss files", (done) => {
        let directory = path.join(__dirname, '..','..', 'test');
        let inputfile = path.join(directory, 'extension.test.ts');
        let uri = vscode.Uri.file(inputfile);

        vscode.workspace.openTextDocument(uri).then(textDocument => {
            return vscode.window.showTextDocument(textDocument).then(editor => {
                let nestRulesPromise = nestRules(editor).then(() => {                
                    assert.fail(); // nestRules should have returned a rejected Promise
                    return Promise.resolve();
                }, (errorMessage) => {
                    assert.equal(errorMessage, "Sorry, this command works only on scss files");
                    return Promise.resolve();
                });

                let nestPropertiesPromise = nestProperties(editor).then(() => {                
                    assert.fail(); // nestProperties should have returned a rejected Promise
                    return Promise.resolve();
                }, (errorMessage) => {
                    assert.equal(errorMessage, "Sorry, this command works only on scss files");
                    return Promise.resolve();
                });

                return Promise.all([nestRulesPromise, nestPropertiesPromise]);
            });            
        }).then((values)=> done(), done);        
    });

    test("Nesting Rules Success", (done) => {
        let directory = path.join(__dirname, '..','..', 'test', 'testData', 'nestCss');
        let inputfile = path.join(directory, 'test-input.scss');
        let outputfile = path.join(directory, 'nest-rules-output.scss');
        let uri = vscode.Uri.file(inputfile);

        let expectedOutputPromise = new Promise((resolve, reject) => {
            fs.readFile(outputfile, 'utf-8', (err, data) => {
                return resolve(data);
            });
        });

        let nestedRulesPromise = vscode.workspace.openTextDocument(uri).then(textDocument => {
            return vscode.window.showTextDocument(textDocument).then(editor => {
                editor.selection = new vscode.Selection(0,0,16,0);
                return nestRules(editor).then(() => {
                    return Promise.resolve(editor.document.getText());
                }, (errorMessage) => {
                    assert.fail();
                    return Promise.resolve();
                });
            });
        });

        Promise.all([nestedRulesPromise, expectedOutputPromise]).then(values => {
            assert.equal(values[0], values[1]);
        }).then((values)=> done(), done); 
    });

    test("Nesting Rules Fails on Invalid Selection", (done) => {
        let directory = path.join(__dirname, '..','..', 'test', 'testData', 'nestCss');
        let inputfile = path.join(directory, 'test-input.scss');        
        let uri = vscode.Uri.file(inputfile);

        vscode.workspace.openTextDocument(uri).then(textDocument => {
            return vscode.window.showTextDocument(textDocument).then(editor => {
                editor.selection = new vscode.Selection(5,15,16,0);
                return nestRules(editor).then(() => {
                    assert.fail(); //nestRules hsould have returned a rejected promise
                    return Promise.resolve();
                }, (errorMessage: string) => {
                    assert.equal(errorMessage.indexOf('Invalid CSS') > -1, true );
                    return Promise.resolve();
                });
            });
        }).then((values)=> done(), done); 
    });
});