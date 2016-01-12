var exec = require('child-process-promise').exec;
var iconv = require('iconv-lite');
import * as vscode from 'vscode';

function execute(command: string): Promise<Buffer> {
    var configuration = vscode.workspace.getConfiguration('codegnuglobal');
	var encoding = configuration.get<string>('encoding');
    var output = 'utf8';
    if (encoding != null && encoding != "") {
        output = 'binary';
    }
    return exec(command, {
		cwd: vscode.workspace.rootPath,
        encoding: output
	})
	.then(function (result): Buffer {
        
        if (encoding != null && encoding != "") {
            var decoded = iconv.decode(result.stdout, encoding);
            return decoded;
        }
		return result.stdout;
	}).fail(function (error) {
		console.error("Error: " + error);
	}).progress(function (childProcess) {
		console.log("Command: " + command + " running...");
	});
};

export class Global {
	exec: string;
	
	run(params: string[]): Promise<Buffer> {
		return execute(this.exec + ' ' + params.join(' '));
	}
	
	parseLine(content: string): any {
		try {
			if (content == null || content == "") return null;

			var values = content.split(/ +/);
			var tag = values.shift();
			var line = parseInt(values.shift()) - 1;
			var path = values.shift().replace("%20", " ");
			var info = values.join(' ');

			return { "tag": tag, "line": line, "path": path, "info": info };
		} catch (ex) {
			console.error("Error: " + ex);
		}
		return null;
	}
	
	constructor(exec:string) {
		this.exec = exec;
	}
}