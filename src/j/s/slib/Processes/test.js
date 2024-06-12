/*
 * Processes Controller Tester
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

Processes = require("./");
myself = new Processes;

function pcb ( oo ) {
    process.stdout.write("Process returns: " + JSON.stringify(oo) + "\n");
}

//myself.get( { command: 'sbin/get_stat_by_id', params: [ '1' ] }, pcb );
myself.get( { command: 'sbin/get_ukrnl_processes', params: [] }, pcb );
