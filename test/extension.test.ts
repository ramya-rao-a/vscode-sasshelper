//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    
    test("Something 1", () => {
        let directory = path.join(__dirname, '..','..', 'test', 'testData');
        let inputfile = path.join(directory, 'test.css');
        let expectedOut
        let uri = vscode.Uri.file(inputfile);
      
                
    });
});