#!/bin/bash

PORT=3000
LOG_FILE="sim.log"

case "$1" in
  start)
    # Check if server is already running
    if lsof -i :$PORT > /dev/null 2>&1; then
      echo "ERROR: SimCity Clone is already running on port $PORT!"
      echo "Use './sim.sh stop' to stop it first, or './sim.sh restart' to restart."
      exit 1
    fi

    echo "Starting SimCity Clone on port $PORT..."
    # Runs the dev server in the background and saves the log
    npm run dev -- --port $PORT > $LOG_FILE 2>&1 &
    echo "Server started in background. Visit http://127.0.0.1:$PORT/simcity-threejs-clone/"
    echo "Use './sim.sh status' to check if it's running."
    echo "Use './sim.sh stop' to stop the server."
    ;;
  stop)
    echo "Searching for SimCity process on port $PORT..."
    PID=$(lsof -t -i:$PORT)
    if [ -z "$PID" ]; then
      echo "No process found on port $PORT."
    else
      kill -9 $PID
      echo "SimCity service (PID $PID) has been shut down."
    fi
    ;;
  restart)
    echo "Restarting SimCity Clone..."
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    lsof -i :$PORT || echo "Service is not running."
    ;;
  clean)
    echo "Cleaning up..."
    $0 stop
    if [ -f "$LOG_FILE" ]; then
      rm $LOG_FILE
      echo "Removed log file: $LOG_FILE"
    fi
    echo "Cleanup complete."
    ;;
  *)
    echo "Usage: ./sim.sh {start|stop|restart|status|clean}"
    exit 1
esac