#!/bin/bash

post_processing_port=2015
interpreter_port=2020
grammar_persistence_port=2666
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
    maybestart "grammar_persistence" "$2" $grammar_persistence_port
    maybestart "post_processing" "$2" $post_processing_port

    # Start gateway last.
    maybestart "gateway" "$2" $gateway_port
elif [ "$1" == "stop" ]; then
    killonport $interpreter_port
    killonport $grammar_persistence_port
    killonport $post_processing_port
    killonport $gateway_port
else
    usage
fi

