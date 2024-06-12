/*
 * Processes' Controller
 * Copyright (C) 2016  Victor C. Salas P. (aka nmag) <nmagko@gmail.com>
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

module.exports = Processes;

function Processes() {};

Processes.prototype = {
    constructor: Processes,
    get: function ( odata, ocbk ) {
	/* System resources API */
        filesystem      = require ('fs');
	
	/* Macro definitions */
	stdin           = process.stdin;
	stdout          = process.stdout;
	stderr          = process.stderr;
	
	/* execFile maskerading */
	execv = require ('child_process').execFile;

	/* Constants */
	ifdefw          = function (debu, iout) { if (debu) stdout.write (iout + '\n') };
	ifndefw         = function (debu, iout) { if (!debu) stdout.write (iout + '\n' ) };
	EXIT_SUCCESS    = 0;
	EXIT_FAILURE    = 1;

	/* Default JSON Configuration: encodings allowed are ascii, utf8 and base64 */
	defconf = {};
	try {
	    defconf = JSON.parse (filesystem.readFileSync(process.cwd() + '/etc/default.json', 'ascii'));
	} catch (e) {
	    ifdefw (1, JSON.stringify(e));
	    return (EXIT_FAILURE);
	}
	
	/* process */
	return execv (
	    odata.command,
	    odata.params,
	    function (err, sout, serr) {
		rows = sout.split("\n");
		for ( j = 0; j < rows.length; j++ ) {
		    rows[j] = rows[j].replace(/\s+/g, " "); //.replace(/(4096)/, "[$1]");
		    rows[j] = rows[j].replace(/:\s+/g, ":");
		    rows[j] = rows[j].replace(/\s$/, "");
		    item = rows[j].split(":");
		    rows[j] = item;
		}
		/* stdout.write('Count: ' + item.length); */
		res = {
		    tab: rows
		};
		if ( err != null ) {
		    ifdefw (defconf.debug, JSON.stringify(err));
                    ocbk ( { return: EXIT_FAILURE, success: false, data: { object: err, res, message: "Command status " + odata.command + " was invalid." } } );
		    return (EXIT_FAILURE);
		} else {
		    ocbk ( { return: EXIT_SUCCESS, success: true, data: { object: res, message: "Command done." } } );
		    return (EXIT_SUCCESS);
		}
	    }
	); // execv
    }
};
