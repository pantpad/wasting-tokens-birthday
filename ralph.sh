#!/bin/bash
# Ralph Wiggum - Long-running AI Agent Script
# Based on Matt Pocock's approach: https://x.com/mattpocockuk
# "Run a coding agent with a clean slate, again and again until a stop condition is met."

set -e

# Check for required argument
if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  echo "Example: $0 10"
  exit 1
fi

MAX_ITERATIONS=$1
PRD_FILE="plans/prd.json"
PROGRESS_FILE="progress.txt"
COMPLETE_TOKEN="<promise>COMPLETE</promise>"
CURSOR_MODEL="opus-4.5-thinking"

# Ensure plans directory exists
mkdir -p plans

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Progress Log" > "$PROGRESS_FILE"
  echo "# Started: $(date)" >> "$PROGRESS_FILE"
  echo "" >> "$PROGRESS_FILE"
fi

# Check if PRD file exists
if [ ! -f "$PRD_FILE" ]; then
  echo "Error: PRD file not found at $PRD_FILE"
  echo "Please create a PRD file first."
  exit 1
fi

echo "🐑 Ralph Wiggum starting..."
echo "   Max iterations: $MAX_ITERATIONS"
echo "   Model: $CURSOR_MODEL"
echo "   PRD file: $PRD_FILE"
echo "   Progress file: $PROGRESS_FILE"
echo ""

for ((i=1; i<=$MAX_ITERATIONS; i++)); do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔄 Iteration $i/$MAX_ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Build the prompt with file references using @ syntax
  PROMPT="@$PRD_FILE @$PROGRESS_FILE

You are working on a codebase with a PRD (Product Requirements Document) of features.

## Instructions

1. Find the highest-priority feature to work on and work ONLY on that feature.
   This should be the one YOU decide has the highest priority - not necessarily the first item.
   Look for features where 'passes' is false.

2. Check that the types check via 'pnpm typecheck' and that the tests pass via 'pnpm test'.

3. Update the PRD ($PRD_FILE) with the work that was done (set 'passes' to true for completed features).

4. Append your progress to the $PROGRESS_FILE file.
   Use this to leave a note for the next agent working in the codebase.
   Include: what you implemented, files changed, any issues encountered, and the timestamp.

5. Make a git commit of that feature with a descriptive commit message.

CRITICAL:
- ONLY WORK ON A SINGLE FEATURE per iteration.
- All commits MUST pass typecheck and tests.
- Always append to $PROGRESS_FILE, never overwrite.

If, while implementing the feature, you notice the PRD is complete (all features have passes=true),
output $COMPLETE_TOKEN at the end of your response."

  # Run cursor-agent with the prompt
  OUTPUT=$(cursor-agent -p "$PROMPT" --model "$CURSOR_MODEL" --output-format text --force --workspace "$(pwd)" 2>&1) || true

  echo "$OUTPUT"

  # Check for completion token
  if echo "$OUTPUT" | grep -q "$COMPLETE_TOKEN"; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ PRD complete, exiting."
    echo "🐑 Ralph finished after $i iterations"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
  fi
  
  echo ""
  echo "⏳ Iteration $i complete, continuing to next iteration..."
  echo ""
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  Ralph reached max iterations ($MAX_ITERATIONS)"
echo "   Check progress.txt for current status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit 1
