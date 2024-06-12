#!/usr/bin/env nodejs
/*
 * Synapses Null Kernel
 * Copyright (C) 2014  Victor C. Salas P. (aka nmag) <nmagko@gmail.com>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* System resources API */
filesystem      = require ('fs');

/* Math resources (-lm) */
lm              = Math;

/* HTTP resources API */
http            = require ('http');
url             = require ('url');

/* Macro definitions */
exit            = function (code) { process.exit(code); };
stdin           = process.stdin;
stdout          = process.stdout;
stderr          = process.stderr;

/* Constants */
ifdefw          = function (debu, iout) { if (debu) stdout.write (iout + '\n') };
ifndefw         = function (debu, iout) { if (!debu) stdout.write (iout + '\n') };
P_FSYNC         = 0;
P_ASYNC         = 1;
EXIT_SUCCESS    = 0;
EXIT_FAILURE    = 1;
program_invocation_name
    = process.argv[1];
program_invocation_short_name
    = program_invocation_name.replace(/^.*\//, "");

/* Basic JSON Configuration: encodings allowed are ascii, utf8 and base64 */
ukrnlcfg = {};
try {
    ukrnlcfg = JSON.parse(filesystem.readFileSync(process.cwd() + '/ukrnl.json', 'ascii'));
} catch (e) {
    ifdefw(1, JSON.stringify(e));
    exit(EXIT_FAILURE);
}

/* Classic Variables */
port            = ukrnlcfg.default_binding_port;
ctlname         = process.argv[2];
amictlr         = 0; /* am i controller? 0: no, 1: yes */
if ( ctlname != null ) {
    ifdefw(1, "I'm " + ctlname + " controller.");
    amictlr = 1;
} else {
    ifdefw(1, "I'm the master.");
}

/* Common methods */
function perror (response, stat, name, desc) {
    pOut = JSON.stringify(
	{
	    "return": EXIT_FAILURE,
	    "data" : {
		"object" : {
		    "pid"  : process.pid,
		    "stat" : stat,
		    "name" : name
		},
		"message" : desc
	    }
	}
    );
    ifdefw(ukrnlcfg.debug, pOut);
    response.write(pOut);
    response.end('\n');
}

/* JSon information and controllers */
collection = {};
try {
    collection = JSON.parse(filesystem.readFileSync(process.cwd() + '/' + ukrnlcfg.collection[amictlr ? amictlr : lm.abs(~amictlr)] + '.json', 'ascii'));
} catch (e) {
    ifdefw(1, JSON.stringify(e));
    exit(EXIT_FAILURE);
}

docs = [];
if ( ctlname != null ) {
    if ( collection.module[ctlname] != null && collection.module[ctlname].status == "A" ) {
	docs[0] = collection.module[ctlname];
	port = docs[0].id;
    } else {
	ifdefw(1, ctlname + " controller not defined." );
	exit(EXIT_FAILURE);
    }
}

/* Master Null Kernel Instance */
http.createServer (
    function (request, response) {
	var pDin = '';
	var pDob = {};
	var pUri = url.parse(request.url).pathname;
	var pExe = process.cwd() + pUri;
	var pDobDebugged = '';

	/* Right now we manage method POST only */
	if ( request.method == 'POST' ) {
	    request.on (
		'data',
		function (data) {
		    pDin += data;
		}
	    );
	    request.on (
		'end',
		function () {
		    if (ukrnlcfg.allow_cors) {
			response.writeHead(200, {
			    'Access-Control-Allow-Origin': '*',
			    'Access-Control-Max-Age': '1000',
			    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
			    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding',
			    'Content-Type': 'application/json'
			});
		    } else {
			response.writeHead(200, {'Content-Type': 'application/json'});
		    }

		    pDob = JSON.parse(pDin);
		    pDobDebugged = JSON.stringify(pDob);
		    pDobDebugged = pDobDebugged.replace(/"password":"[^"]*"/gi, '"password":"******"');
		    ifdefw(ukrnlcfg.debug, pDobDebugged);

		    wdocs = [];
		    if ( ! amictlr ) {
			/* Master */
			if ( collection.module[pDob.controller] != null && collection.module[pDob.controller].status == "A" ) {
			    wdocs[0] = collection.module[pDob.controller];
			    ifdefw(ukrnlcfg.debug, JSON.stringify(wdocs));
			} else {
			    ifdefw(ukrnlcfg.debug, JSON.stringify({ return: EXIT_FAILURE, data: [] }));
			    response.write(JSON.stringify({ return: EXIT_FAILURE, data: { object: [], message: "Collection find error." } }));
			    return(EXIT_FAILURE);
			}
			if ( wdocs.length == 1 ) {
			    /* HTTP Header */
			    headers = {
				'Content-Type': 'application/json',
				'Content-Length': pDin.length
			    };
			    
			    /* HTTP Options */
			    options = {
				host: wdocs[0].host,
				port: wdocs[0].id,
				path: wdocs[0].path + pDob.controller,
				method: 'POST',
				headers: headers
			    };
			    
			    /* HTTP Request */
			    req = http.request (
				options, function(res) {
				    //res.setEncoding('utf-8');
				    reString = '';
				    
				    res.on (
					'data', function(data) {
					    reString += data;
					}
				    );
				    
				    res.on (
					'end', function() {
					    response.write(reString);
					    response.end('\n');
					}
				    );
				}
			    );
			    
			    req.on (
				'error', function(e) {
				    response.write(JSON.stringify({ return: EXIT_FAILURE, data: { object: e, message: "HTTP request error." } }));
				    response.end('\n');
				}
			    );
			    
			    req.write ( pDin );
			    req.end();
			    
			    return(EXIT_SUCCESS);
			} else {
			    ifdefw(ukrnlcfg.debug, pDob.controller + " controller not defined." );
			    perror(response, EXIT_FAILURE, pDob.controller, "Not defined.");
			    return(EXIT_FAILURE);
			}
			/* Master end */
		    } else {
			/* Controller */
			/* TODO: If want some security check rule, write here. */
			/* { controller: "Xyyy", method: "zzz", params: { ... } } */
			Controller = require ("." + docs[0].path + ctlname);
			myself = new Controller;
			eCode =	'myself.'
			    + pDob.method
			    + '('
			    + JSON.stringify(pDob.params)
			    + ','
			    + '  function ( octlr ) {'
			    + '    ifdefw(ukrnlcfg.debug, "Process returns: " + JSON.stringify(octlr) + "\\n");'
			    + '    response.write(JSON.stringify(octlr));'
			    + '    response.end("\\n");'
			    + '  }'
			    + ')' ;
			eval(eCode);
		    }
		    return(EXIT_SUCCESS);
		}
	    );
	    /* Added by default */
	    return(EXIT_SUCCESS);
	} else {
	    /* You have to program here if you want to manage method GET */
	    if (ukrnlcfg.allow_cors) {
		response.writeHead(200, {
		    'Access-Control-Allow-Origin': '*',
		    'Access-Control-Max-Age': '1000',
		    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
		    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding',
		    'Content-Type': 'application/json'
		});
	    } else {
		response.writeHead(200, {'Content-Type': 'application/json'});
	    }
	    perror(response, EXIT_FAILURE, pExe, "Only method POST is allowed.");
	    return(EXIT_FAILURE);
	}
    }
).listen(port);

ifdefw(ukrnlcfg.debug, program_invocation_short_name + ' ' + ukrnlcfg.version.major + '.' + ukrnlcfg.version.minor + '.' + ukrnlcfg.version.patch);
ifdefw(ukrnlcfg.debug, ukrnlcfg.license);
stdout.write(program_invocation_short_name + '(' + process.pid + ':' + amictlr + ')'  + ' started at port: ' + port + '.\n');
