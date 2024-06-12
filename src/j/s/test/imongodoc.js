/*
 * Insert Mongo Document
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

MongoClient = require('mongodb').MongoClient;

format = require('util').format;

MongoClient.connect (
    'mongodb://127.0.0.1:27017/test',
    function (err, db) {
	if(err) throw err;
	collection = db.collection('test_insert');
	collection.insert (
	    {
		class : "FA",
		code : 5,
		name : "Rodomuntess",
		attributes :
		{
		    age : 36,
		    width : 40,
		    height : 170,
		    unit : "cm"
		}
	    },
	    function (err, docs) {
		collection.count (
		    function (err, count) {
			console.log(format("count = %s", count));
		    }
		);

		// Locate all the entries using find
		collection.find().toArray (
		    function (err, results) {
			console.dir(results);
			// Let's close the db
			db.close();
		    }
		);
	    }
	);
    }
);
