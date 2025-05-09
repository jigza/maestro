#!/bin/bash

# Script to add error management protocol to all mode files
# Created by Troy Molander on May 7, 2025

# Define base directory
BASE_DIR="/Users/troymolander/Development/Agentience/maestro"
TEMPLATE_FILE="$BASE_DIR/docs/templates/error-management-protocol-template.md"

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Template file not found at $TEMPLATE_FILE"
  exit 1
fi

# Read template content
TEMPLATE_CONTENT=$(cat "$TEMPLATE_FILE")

# Counter for tracking updates
SUCCESS_COUNT=0
SKIP_COUNT=0
ALREADY_HAS_COUNT=0
ERROR_COUNT=0

# Process all mode files
for MODE_FILE in "$BASE_DIR"/*-mode.md; do
  # Get filename only
  FILENAME=$(basename "$MODE_FILE")
  
  # Skip ErrorManager and already updated files
  if [[ "$FILENAME" == "ErrorManager-mode.md" || "$FILENAME" == "BackendForge-mode.md" || "$FILENAME" == "ReactMaster-mode.md" ]]; then
    echo "Skipping $FILENAME (already updated or ErrorManager)"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi
  
  echo "Processing $FILENAME..."
  
  # Check if file already has Error Management Protocol
  if grep -q "### Error Management Protocol" "$MODE_FILE"; then
    echo "$FILENAME already contains error management protocol section"
    ALREADY_HAS_COUNT=$((ALREADY_HAS_COUNT + 1))
    continue
  fi
  
  # Find line number of "YOU MUST REMEMBER" to insert before
  YOU_MUST_LINE=$(grep -n "YOU MUST REMEMBER" "$MODE_FILE" | cut -d: -f1)
  
  if [ -n "$YOU_MUST_LINE" ]; then
    # Create temp file and update content
    TMP_FILE=$(mktemp)
    head -n $((YOU_MUST_LINE - 1)) "$MODE_FILE" > "$TMP_FILE"
    echo -e "\n### Error Management Protocol\n$TEMPLATE_CONTENT\n" >> "$TMP_FILE"
    tail -n +$((YOU_MUST_LINE)) "$MODE_FILE" >> "$TMP_FILE"
    
    # Replace original with updated content
    mv "$TMP_FILE" "$MODE_FILE"
    echo "Successfully updated $FILENAME"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "Could not find 'YOU MUST REMEMBER' in $FILENAME, cannot update"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  fi
done

echo ""
echo "Update Summary:"
echo "Successfully updated: $SUCCESS_COUNT files"
echo "Already had protocol: $ALREADY_HAS_COUNT files"
echo "Skipped: $SKIP_COUNT files"
echo "Failed to update: $ERROR_COUNT files"
echo ""
echo "Total processed: $((SUCCESS_COUNT + ALREADY_HAS_COUNT + SKIP_COUNT + ERROR_COUNT)) files"
