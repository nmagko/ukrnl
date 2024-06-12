/*
 * ukrnl.js Processes low level module
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

#define _GNU_SOURCE

#include <unistd.h>
#include <dirent.h>

#include <stdio.h>
#include <errno.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

#include "processes.h"

int isnumber (const char* ccharptr_characterlist) {
  for (; *ccharptr_characterlist; ccharptr_characterlist++) {
    if (*ccharptr_characterlist < '0' || *ccharptr_characterlist > '9') {
      return 0; /* false */
    }
  }
  return 1; /* true */
}

char *stat_wrapper (char *xtended, const char *status) {
  switch (status[0]) {
  case 'R': strcpy(xtended, "Running"); break;
  case 'S': strcpy(xtended, "Sleeping"); break;
  case 'D': strcpy(xtended, "Waiting"); break;
  case 'Z': strcpy(xtended, "Zombie"); break;
  case 'T': strcpy(xtended, "Stopped"); break;
  case 't': strcpy(xtended, "Trace"); break;
  case 'W': strcpy(xtended, "Paging"); break;
  case 'X':
  case 'x': strcpy(xtended, "Dead"); break;
  case 'K': strcpy(xtended, "Wakekill"); break;
  case 'P': strcpy(xtended, "Parked"); break;
  default: strcpy(xtended, "Unknown");
  }
  return xtended;
}

long int pages4k_wrapper (const char *pages) {
  return 4096 * atol(pages);
}

int strcmp_wrapper (const char *s1, const char *s2, int sensitive) {
  if (sensitive) {
    return !strcmp(s1, s2);
  } else {
    return !strcasecmp(s1, s2);
  }
}

int strstr_wrapper (const char* haystack, const char* needle, int sensitive) {
  if (sensitive) {
    return (intptr_t) strstr(haystack, needle);
  } else {
    return (intptr_t) strcasestr(haystack, needle);
  }
}

int getstatbypid (const char *cc_pid) {
  char cmdlinepath[256];
  char statpath[256];
  char cmdproc[2048];

  char *procbuffer = NULL;
  size_t len = 0;

  char procstat[52][630];
  char xstatus[16];

  if (isnumber(cc_pid)) {
    strcpy(cmdlinepath, PROC_PATH);
    strcat(cmdlinepath, cc_pid);
    strcat(cmdlinepath, "/cmdline");
    
    strcpy(statpath, PROC_PATH);
    strcat(statpath, cc_pid);
    strcat(statpath, "/stat");
    
    /* open the file for reading */
    FILE* cmdlinefd = fopen (cmdlinepath, "rb");
    
    if (cmdlinefd) {
      cmdproc[0] = 0;
      while ( getdelim ( &procbuffer, &len, 0, cmdlinefd) > 0 ) {
	strcat(cmdproc, procbuffer);
	strcat(cmdproc, " ");
	free(procbuffer);
	len = 0;
      }
      /* close the file prior to exiting the routine */
      fclose(cmdlinefd);
      
      /* get stat from /proc/<pid>/stat */
      FILE* statfd = fopen (statpath, "rt");
      
      if (statfd) {
	for (int stati = 0; stati < 52; stati++ ) {
	  procstat[stati][0] = 0;
	  fscanf(statfd, "%s", procstat[stati]);
	}
	fclose(statfd);
	printf("NAME: %s\n", procstat[1]);
	printf("CMD: %s\n", cmdproc);
	printf("PID: %s\n", cc_pid);
	printf("SID: %s\n", procstat[5]);
	printf("PPID: %s\n", procstat[3]);
	printf("STATUS: %s\n", stat_wrapper(xstatus, procstat[2]));
	printf("PHYS_RAM: %ld\n", pages4k_wrapper(procstat[23]));
	printf("VIRT_RAM: %s\n", procstat[22]);
	printf("THREADS: %s\n", procstat[19]);
	printf("NICE: %s\n", procstat[18]);
	printf("USR_TIME: %s\n", procstat[13]);
	printf("USR_WAIT: %s\n", procstat[15]);
	printf("SYS_TIME: %s\n", procstat[14]);
	printf("SYS_WAIT: %s\n", procstat[16]);
	printf("TTY: %s\n", procstat[6]);
	return EXIT_SUCCESS;
      } else {
	printf("Cannot open process status.\n");
      }
    } else {
      printf("Cannot open process load details.\n");
    }
  } else {
    printf("You have to give a valid PID number.\n");
  }
  return EXIT_FAILURE;
}

int getpidbyname_implements (const char* p_search_pt, int itsmain, int sensitiveness, int exactmatch, int xformat) {
  char cmdlinepath[256];

  char *procbuffer = NULL;
  size_t len = 0;

  char procloader[512];
  char procmain[512];
  char procmodule[512];

  char *processldrshortname = NULL;
  char *procmainshortname = NULL;

  int procexit = EXIT_FAILURE;
  struct dirent * de_direntity = NULL;
  DIR* procpath = NULL;

  char statpath[256];

  char procstat[52][630];
  char xstatus[16];

  int procshow = 0;
  
  int (*fcompare) (const char*, const char*, int);
  if (exactmatch) {
    fcompare = &strcmp_wrapper;
  } else {
    fcompare = &strstr_wrapper;
  }
  
  procpath = opendir(PROC_PATH);
  if (procpath == NULL) {
    printf ("Couldn't open the %s folder.\n", PROC_PATH);
    return EXIT_FAILURE;
  }
  
  /* proccesses path loop */
  while ( (de_direntity = readdir(procpath)) ) {
    procshow = 0;
    if (de_direntity->d_type == DT_DIR) {
      if (isnumber(de_direntity->d_name)) {

	strcpy(cmdlinepath, PROC_PATH);
	strcat(cmdlinepath, de_direntity->d_name);
	strcat(cmdlinepath, "/cmdline");

	strcpy(statpath, PROC_PATH);
	strcat(statpath, de_direntity->d_name);
	strcat(statpath, "/stat");

	/* open the file for reading */
	FILE* cmdlinefd = fopen (cmdlinepath, "rb");

	if (cmdlinefd) {
	  /* grep names from /proc/<pid>/cmdline */
	  procloader[0] = 0;
	  len = 0;
	  if ( getdelim(&procbuffer, &len, 0, cmdlinefd) > 0 ) {
	    strcpy(procloader, procbuffer);
	    free(procbuffer);
	  }
	  procmain[0] = 0;
	  len = 0;
	  if ( getdelim(&procbuffer, &len, 0, cmdlinefd) > 0 ) {
	    strcpy(procmain, procbuffer);
	    free(procbuffer);
	  }
	  procmodule[0] = 0;
	  len = 0;
	  if ( getdelim(&procbuffer, &len, 0, cmdlinefd) > 0 ) {
	    strcpy(procmodule, procbuffer);
	    free(procbuffer);
	  }
	  /* close the file prior to exiting the routine */
	  fclose(cmdlinefd);

	  if ( procmodule[0] == 0 ) {
	    strcpy(procmodule, "(kernel)");
	  }
	  
	  if ( itsmain ) { /* compare main process */
	    if (strrchr(procmain, '/')) {
	      procmainshortname = strrchr(procmain, '/') + 1;
	    } else {
	      procmainshortname = procmain;
	    }
	    if ( fcompare(procmainshortname, p_search_pt, sensitiveness) ) {
	      procshow = 1;
	    }
	  } else { /* compare loader process */
	    if (strrchr(procloader, '/')) {
	      processldrshortname = strrchr(procloader, '/') + 1;
	    } else {
	      processldrshortname = procloader;
	    }
	    if ( fcompare(processldrshortname, p_search_pt, sensitiveness) ) {
	      procshow = 1;
	    }
	  }

	  if ( procshow ) {
	    if ( procexit == EXIT_FAILURE && (!xformat) ) {
	      printf("LDR:MAIN:MOD:PID:SID:PPID:STAT:PRAM:VRAM:THRD:NICE:UTIM:UWAI:STIM:SWAI:TTY\n");
	    }
	    procexit = EXIT_SUCCESS;
	    /* get stat from /proc/<pid>/stat */
	    FILE* statfd = fopen (statpath, "rt");
	    
	    if (statfd) {
	      for (int stati = 0; stati < 52; stati++ ) {
		procstat[stati][0] = 0;
		fscanf(statfd, "%s", procstat[stati]);
	      }
	      fclose(statfd);
	      if (xformat) {
		printf("LOADER: %s\n", procloader);
		printf("MAIN: %s\n", procmain);
		printf("MODULE: %s\n", procmodule);
		printf("PID: %s\n", de_direntity->d_name);
		printf("SID: %s\n", procstat[ 5]);
		printf("PPID: %s\n", procstat[ 3]);
		printf("STATUS: %s\n", stat_wrapper(xstatus, procstat[ 2]));
		printf("PHYS_RAM: %ld\n", pages4k_wrapper(procstat[23]));
		printf("VIRT_RAM: %s\n", procstat[22]);
		printf("THREADS: %s\n", procstat[19]);
		printf("NICE: %s\n", procstat[18]);
		printf("USR_TIME: %s\n", procstat[13]);
		printf("USR_WAIT: %s\n", procstat[15]);
		printf("SYS_TIME: %s\n", procstat[14]);
		printf("SYS_WAIT: %s\n", procstat[16]);
		printf("TTY: %s\n", procstat[ 6]);
	      } else {
		printf("%s:%s:%s:%s:%s:%s:%s:%ld:%s:%s:%s:%s:%s:%s:%s:%s\n",
		       procloader, procmain, procmodule, de_direntity->d_name,
		       procstat[ 5], procstat[ 3], stat_wrapper(xstatus, procstat[ 2]),
		       pages4k_wrapper(procstat[23]), procstat[22], procstat[19],
		       procstat[18], procstat[13], procstat[15], procstat[14],
		       procstat[16], procstat[ 6]);
	      }
	    }
	    if (xformat) printf("--\n");
	  }
	}
      }
    }
  }
  closedir(procpath);
  if ( procexit == EXIT_FAILURE ) {
    printf("There is not any %s process for this instance.\n", p_search_pt);
  }
  return procexit;
}

int getpidbyname_wrapper (const char* p_search_pt, ... ) {
  int tempargument;
  int inputarguments[4];
  /*
   * inputarguments[0] = 0;
   * inputarguments[1] = 0;
   */
  memset(inputarguments, 0, sizeof(inputarguments) );
  int inputindex;
  va_list argptr;
  
  va_start( argptr, p_search_pt );
  for (inputindex = 0;  (tempargument = va_arg( argptr, int )) != 15; ++inputindex) {
    inputarguments[inputindex] = tempargument;
  }
  va_end( argptr );
  return getpidbyname_implements(p_search_pt, inputarguments[0], inputarguments[1], inputarguments[2], inputarguments[3]);
}

int main (int argc, char *argv[]) {
  /*
   * input: search string,
   *        process: loader = 0 | main = 1,
   *        case: insensitive = 0 | sensitive = 1,
   *        match: part of string = 0 | whole string = 1
   *
   * return: 0 = found,
   *         1 = not found
   */
  if ( strcmp_wrapper ( program_invocation_short_name, "get_ukrnl_processes", 1 ) ) {
    int xformat = 0;
    if ( argc > 1 ) {
      if ( strcmp_wrapper ( argv[1], "-l", 1 ) ) {
	xformat = 1;
      }
    }
    return getpidbyname("ukrnl.js", 1, 0, 1, xformat);
  }
  if ( strcmp_wrapper ( program_invocation_short_name, "get_stat_by_id", 1 ) ) {
    if ( argc > 1 ) {
      return getstatbypid(argv[1]);
    }
    printf("You have to give a PID number.\n");
    return EXIT_FAILURE;
  }
  printf("You must not load this directly (ref. get_(ukrnl_processes (-l)?|stat_by_id pid))\n");
  return EXIT_FAILURE;
}
