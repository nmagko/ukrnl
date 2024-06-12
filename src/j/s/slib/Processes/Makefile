#
#  Process low level module Makefile
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
CCOPTIONS = -std=gnu99
CCFLAGS   = -O2 $(CCOPTIONS) -Wall -I.
PREFIX    = .
STRIP     = strip
RM        = rm
LN        = ln
MOVE      = mv

all: clean processes binary

clean:
	$(RM) -f get_ukrnl_processes get_stat_by_id
	$(RM) -f *~
	$(RM) -f *.o *.a
	$(RM) -f lib*.so.* *.dll
	$(RM) -f processes processes.exe

processes:
	$(CC) $(CCFLAGS) -c processes.c

binary:
	$(CC) $(CCFLAGS) -o processes processes.o
	$(STRIP) processes
	$(RM) -f processes.o
	$(LN) -s processes get_ukrnl_processes
	$(LN) -s processes get_stat_by_id

install:
	$(MOVE) -f processes get_ukrnl_processes get_stat_by_id ../../sbin/

uninstall:
	$(RM) -f ../../sbin/get_ukrnl_processes ../../sbin/get_stat_by_id ../../sbin/processes
