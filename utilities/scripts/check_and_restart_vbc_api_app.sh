#!/bin/bash
PID=$(~/.nvm/versions/node/v10.22.1/bin/pm2 pid vbc-appointment-select) > /dev/null
~/.nvm/versions/node/v10.22.1/bin/pm2 describe vbc-appointment-select > /dev/null
RUNNING=$?
curl http://localhost:8080/api/v2/calendars -s > /dev/null
CALL_SUCCESSFUL=$?

if [ "${RUNNING}" -ne 0 ] || [ "${PID}" -eq 0 ] || [ "${CALL_SUCCESSFUL}" -ne 0 ]; then
  cd ~/repositories/vbc-appointment-select; ~/.nvm/versions/node/v10.22.1/bin/pm2 start apps.json
fi;