/*
 * Process Encapsulation
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
pDob            = JSON.parse(process.argv[2]);

/* Macro definitions */
stdin           = process.stdin;
stdout          = process.stdout;
stderr          = process.stderr;

/* execFile maskerading */
execv = require ('child_process').execFile;

/* callback method */
function execvCB (err, sout, serr) {
    /* how many elements we want? */
    w = 9;
    rows = sout.split("\n");
    for ( j = 0; j < rows.length; j++ ) {
	rows[j] = rows[j].replace(/\s+/g, " "); //.replace(/(4096)/, "[$1]");
	item = rows[j].split(" ");
	for ( i = w; i < item.length; i++ ) {
	    /* Last item is 8 = 9-1 = w-1 */
	    item[w-1] += " " + item[i];
	}
	item.splice(w, item.length - w);
	rows[j] = item;
    }
    /* stdout.write('Count: ' + item.length); */
    res = {
	tab: rows
    };
    if ( err != null ) {
	stdout.write(JSON.stringify(err));
    } else {
	stdout.write(JSON.stringify(res));
	/* stdout.write('Rows count: ' + rows.length); */
    }
}

/* process */
runner = execv (pDob.command, pDob.params, execvCB);
