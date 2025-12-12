#!/bin/bash

# Script to set Java 17 as the active Java version for this React Native project
# Note: React Native currently works best with Java 17 for library compatibility
# Usage: source ./use-java-17.sh

export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo "Java 17 activated for React Native"
echo "JAVA_HOME=$JAVA_HOME"
java -version
