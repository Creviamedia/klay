#!/usr/bin/env bash
# Klay Consultants Time Machine CLI
# Allows instant rollback, comparison, and jumping across project milestones.

set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

command="$1"
target="$2"

case "$command" in
  "list")
    echo "=== Klay Time Machine Milestones ==="
    git tag -l -n3 "klay-v*"
    ;;
  "status")
    echo "=== Current Working Tree Status ==="
    git status -s
    echo ""
    echo "Current commit: $(git rev-parse --short HEAD) on branch $(git rev-parse --abbrev-ref HEAD)"
    ;;
  "diff")
    if [ -z "$target" ]; then
      target="klay-v0.1-baseline"
    fi
    echo "=== Changes relative to milestone: $target ==="
    git diff --stat "$target"
    ;;
  "rollback")
    if [ -z "$target" ]; then
      echo "Error: Specify a milestone tag to roll back to. Example:"
      echo "  ./scripts/time-machine.sh rollback klay-v0.1-baseline"
      exit 1
    fi
    echo "WARNING: Rolling back working tree to $target..."
    git checkout "$target"
    echo "Time Machine jump to $target successful!"
    ;;
  "create-milestone")
    if [ -z "$target" ]; then
      echo "Error: Specify tag name and description. Example:"
      echo "  ./scripts/time-machine.sh create-milestone klay-v0.2-staging 'Staging environment and cost calculator ready'"
      exit 1
    fi
    desc="${3:-Milestone created by Time Machine}"
    git tag -a "$target" -m "$desc"
    echo "Milestone $target created."
    ;;
  *)
    echo "Klay Time Machine Usage:"
    echo "  ./scripts/time-machine.sh list                        # List all milestone checkpoints"
    echo "  ./scripts/time-machine.sh status                      # View current working tree state"
    echo "  ./scripts/time-machine.sh diff [tag]                  # View code changes since milestone"
    echo "  ./scripts/time-machine.sh rollback <tag>              # Revert to a milestone checkpoint"
    echo "  ./scripts/time-machine.sh create-milestone <tag> [desc] # Save a new milestone checkpoint"
    ;;
esac
