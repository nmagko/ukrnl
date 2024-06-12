#!/usr/bin/env nodejs
/*
 * ukrnl.js Module Tester
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

/* Macro definitions */
stdin           = process.stdin;
stdout          = process.stdout;
stderr          = process.stderr;

/* HTTP resources API */
http            = require('http');

/* Controller's Parameters */
postdata = JSON.stringify
(
    {
	controller: 'Processes',
	method: 'get',
	params: {
	    command: 'sbin/get_ukrnl_processes',
	    params: [ ]
	}
    }
);

/* HTTP Header */
headers = {
    'Content-Type': 'application/json',
    'Content-Length': postdata.length
};

/* HTTP Options */
options = {
    host: 'localhost',
    port: 4000,
    path: '/slib/Processes',
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
		reObject = JSON.parse(reString);
		stdout.write(JSON.stringify(reObject) + '\n');
	    }
	);
    }
);

req.on (
    'error', function(e) {
	stdout.write(JSON.stringify({return: 1, data: e}) + '\n');
    }
);

req.write ( postdata );
req.end();
