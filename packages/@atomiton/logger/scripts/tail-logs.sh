#!/bin/bash

# Get the project root (assuming this script is run from anywhere in the project)
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# Default log file location in project tmp folder
DEFAULT_LOG_DIR="$PROJECT_ROOT/tmp/logs"
DEFAULT_LOG_FILE="$DEFAULT_LOG_DIR/atomiton.log"

# Allow overriding log location via environment variable
LOG_FILE="${ATOMITON_LOG_FILE:-$DEFAULT_LOG_FILE}"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Touch the file if it doesn't exist
touch "$LOG_FILE"

echo "📝 Tailing Atomiton logs from: $LOG_FILE"
echo "-------------------------------------------"

# Use tail -F to follow the file even if it's rotated
tail -F "$LOG_FILE" 2>/dev/null || {
  echo "⚠️  Log file not found or not accessible: $LOG_FILE"
  echo "Creating empty log file..."
  touch "$LOG_FILE"
  tail -F "$LOG_FILE"
}