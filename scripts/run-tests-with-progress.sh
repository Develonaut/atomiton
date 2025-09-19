#!/bin/sh

# Simple progress indicator for turbo test runs
# Usage: ./run-tests-with-progress.sh <test-command>

TEST_COMMAND="$1"
FILTER="$2"

# Function to show spinner
show_progress() {
  local pid=$1
  local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local i=0

  while kill -0 $pid 2>/dev/null; do
    i=$(( (i+1) % ${#spin} ))
    printf "\r%s Testing packages... " "${spin:$i:1}"
    sleep 0.1
  done

  printf "\r✓ "
}

# Run the turbo command in the background
if [ -z "$FILTER" ]; then
  pnpm turbo run $TEST_COMMAND --ui stream --output-logs=errors-only --log-order=grouped > /tmp/turbo-output.txt 2>&1 &
else
  pnpm turbo run $TEST_COMMAND --filter="$FILTER" --ui stream --output-logs=errors-only --log-order=grouped > /tmp/turbo-output.txt 2>&1 &
fi

TURBO_PID=$!

# Show progress spinner
show_progress $TURBO_PID

# Wait for turbo to finish and get exit code
wait $TURBO_PID
EXIT_CODE=$?

# If there was an error, show the full output
if [ $EXIT_CODE -ne 0 ]; then
  cat /tmp/turbo-output.txt
else
  # Show success summary
  echo "All tests passed!"
fi

# Clean up
rm -f /tmp/turbo-output.txt

exit $EXIT_CODE