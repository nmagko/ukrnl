/*
 * start executes ukrnl.js and modules like owner's user and group
 * Copyright (C) 2000-2016  Victor C. Salas P. (aka nmag) <nmagko@gmail.com>
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

/*
 * This module allows whatever user exist in server instances to execute
 * any program like user and group from start executable program owner.
 */

#define _GNU_SOURCE

#include <sys/stat.h>
#include <fcntl.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <ctype.h>

#include "uregex.h"
#include "start.h"

int main ( int argc, char *argv[] ) {
  if ( argc <= 2 ) {
    printf ( "You must not load this directly (ref. %s krnl mod (args)?)\n", program_invocation_short_name );
  }
  exit(execsuid(argc, argv));
}

int execsuid ( int su_argc, char *su_argv[] ) {
  static uid_t uid, gid;
  static uid_t suid, sgid;
  struct stat sb;
  char *argl[MAXLEN];
  int argi;
  int fdlog;
  char *logname;

  /* simple check arguments */
  if ( su_argc <= 2 ) {
    return EXIT_FAILURE;
  }

  /* filling arguments structure before clone and execv */
  for ( argi=1; argi < su_argc; argi++ ) {
    argl[argi-1] = xmalloc ( strlen(su_argv[argi]) + 1 );
    memcpy ( argl[argi-1], su_argv[argi], strlen(su_argv[argi]) );
  }
  
  /* module logger */
  logname = xmalloc ( strlen(su_argv[2]) + 1 );
  strcpy ( logname, su_argv[2] );
  logname = as_rex(logname, "/", ".", "g");
  logname = as_rex(logname, "^", "log/", "");
  logname = as_rex(logname, "$", ".log", "");
  if ( ( fdlog = open(logname, O_WRONLY | O_APPEND | O_CREAT, 0666) ) < 0 ) {
    return xperror("logger");
  }
  free(logname);
  
  /* dettaching terminal */
  if ( daemon(1, 0) < 0 ) {
    return xperror("daemon");
  }
  
  /* stdout and stderr */
  if ( dup2(fdlog, STDOUT_FILENO) < 0 ) {
    return xperror("stdout");
  }
  if ( dup2(fdlog, STDERR_FILENO) < 0 ) {
    return xperror("stderr");
  }
  close(fdlog);
  
  /* get uid and gid of application file */
  if ( stat(program_invocation_name, &sb ) == -1 ) {
    return xperror("stat");
  } else {
    suid = sb.st_uid;
    sgid = sb.st_gid;
  }
    
  /* backup original user and group ids */
  uid = getuid();
  gid = getgid();
  
  /* setup scheme owner privileges */
  if ( ( setuid(suid) ) < 0 ) { // i.e. root (0)
    return xperror ("set_new_uid");
  }
  if ( ( setgid(sgid) ) < 0 ) { // i.e. sys (3)
    setuid(uid); /* trying to recover original uid */
    return xperror ("set_new_gid");
  }
  
  /* start application with privileges */
  if ( execv ( argl[0], argl ) < 0 ) {
    setgid(gid); /* trying to recover original gid */
    setuid(uid); /* trying to recover original uid */
    return xperror ("execv");
  }
  
  /* trying to recover original user and group ids before ends */
  if ( ( setgid(gid) ) < 0 ) { /* recover original gid */
    setuid(uid); /* trying to recover original uid */
    return xperror ("set_old_gid");
  }
  if ( ( setuid(uid) ) < 0 ) { /* recover original uid */
    return xperror ("set_old_uid");
  }
  
  return EXIT_SUCCESS;
}

int xperror (register char *s) {
  char str[50];
  sprintf (str,"%s(%s)", program_invocation_short_name, s);
  perror (str);
  return EXIT_FAILURE;
}
