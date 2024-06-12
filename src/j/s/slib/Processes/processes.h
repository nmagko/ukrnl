/*
 * ukrnl.js Processes header low level module
 * Copyright 2016 by Victor C. Salas P. (aka nmag) nmagko@gmail.com
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
 */

#ifndef UKRNL_PROCESSES_H
#define UKRNL_PROCESSES_H

#define _GNU_SOURCE

#define PROC_PATH "/proc/"

int isnumeric(const char*);

char *stat_wrapper (char *, const char *);

long int pages4k_wrapper (const char *);
  
int strcmp_wrapper(const char *, const char *, int);

int strstr_wrapper(const char *, const char *, int);

int getstatbypid (const char *);

int getpidbyname_implements(const char *, int, int, int, int);

int getpidbyname_wrapper(const char *, ... );

#define getpidbyname(p_search_pt,...) getpidbyname_wrapper(p_search_pt, ##__VA_ARGS__, (int) 15)

#endif /* UKRNL_PROCESSES_H */
