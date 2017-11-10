#!/bin/bash

postmalone_port=2015
interpreter_port=2020
lilyachty_port=2666
gateway_port=2420

function usage() {
    echo 'Usage: ./services.sh [start || stop] +[service]'
}

function maybestart() {
    # $1 is target service, $2 is second argument of script, $3 is port
    if [ "$1" == "$2" ] || [ "$2" == "" ]; then
        killonport $3
        echo Starting "$1"...
        mkdir -p logs/
        python3 $1/run.py --logging=true &
        echo Started "$1"
    fi
}

function killonport() {
    echo Killing task on port "$1"
    lsof -ti:"$1" | xargs kill
}

if [ "$1" == "start" ]; then
    maybestart "interpreter" "$2" $interpreter_port
    maybestart "lilyachty" "$2" $lilyachty_port
    maybestart "postmalone" "$2" $postmalone_port

    # Start gateway last.
    maybestart "gateway" "$2" $gateway_port
elif [ "$1" == "stop" ]; then
    killonport $interpreter_port
    killonport $lilyachty_port
    killonport $postmalone_port
    killonport $gateway_port
else
    usage
fi

