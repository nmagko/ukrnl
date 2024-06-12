#
#  Init low level module and objects for ukrnl.js
#  Copyright (C) 2016  Victor C. Salas P. (aka nmag) <nmagko@gmail.com>
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

CC        = gcc
CCOPTIONS = #-fPIC
CCFLAGS   = -O2 $(CCOPTIONS) -Wall -I. -I../../include
PREFIX    = .
STRIP     = strip
RM        = rm
LN        = ln
MOVE      = mv
CHMOD     = chmod
CHOWN     = chown
UGID      = ${shell id -u}.${shell id -g}
NESTEDOBJ = -L../../sbin -luregex -Wl,-rpath=sbin,-rpath=.

all: clean objects binary

clean:
	$(RM) -f *~
	$(RM) -f *.o *.a
	$(RM) -f lib*.so.* *.dll
	$(RM) -f start start.exe

objects:
	$(CC) $(CCFLAGS) -c start.c

binary:
	$(CC) $(CCFLAGS) -o start start.o $(NESTEDOBJ)
	$(RM) -f start.o
	$(STRIP) start
	$(CHOWN) $(UGID) start
	$(CHMOD) 6755 start

install:
	$(MOVE) -f start ../../sbin/

uninstall:
	$(RM) -f ../../sbin/start
