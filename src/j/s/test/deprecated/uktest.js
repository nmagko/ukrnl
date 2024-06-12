#!/usr/bin/env nodejs
/*
 * Universal Kernel Tester
 * Copyright (C) 2014  Victor C. Salas P. (aka nmag) <nmagko@gmail.com>
 *
 *  This program is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or (at
 *  your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful, but
 *  WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software Foundation,
 *  Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 */

/* Constants */
pPath           = process.argv[2] || './';

/* Macro definitions */
//exit          = function (code) { return(code); };
stdin           = process.stdin;
stdout          = process.stdout;
stderr          = process.stderr;

var http = require('http');

var user = {
    username: 'nmagko',
    email: 'nmagko@gmail.com',
    firstName: 'Victor',
    lastName: 'C',
    command: '/bin/ls',
    params: [ '-ltrap', pPath ]
};

var userString = JSON.stringify(user);

var headers = {
    'Content-Type': 'application/json',
    'Content-Length': userString.length
};

var options = {
    host: 'localhost',
    port: 4000,
    path: '/test/pencap.js',
    method: 'POST',
    headers: headers
};

var req = http.request (
    options, function(res) {
	//res.setEncoding('utf-8');
	var responseString = '';
	
	res.on (
	    'data', function(data) {
		responseString += data;
	    }
	);
	
	res.on (
	    'end', function() {
		var resultObject = JSON.parse(responseString);
		stdout.write(JSON.stringify(resultObject) + '\n');
	    }
	);
    }
);

req.on (
    'error', function(e) {
	stdout.write(JSON.stringify(e) + '\n');
    }
);

req.write ( userString );
req.end();
