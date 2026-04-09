#!/usr/bin/env bash
# autoresearch-loop.sh
#
# Runs all autoresearch checks in a loop while you sleep.
# Each iteration: i18n drift → schema validation → lighthouse → bundle check
#
# Usage:
#   bash scripts/autoresearch-loop.sh              # run once
#   bash scripts/autoresearch-loop.sh --loop 600   # repeat every 10 minutes
#   bash scripts/autoresearch-loop.sh --loop 3600  # repeat every hour
#   bash scripts/autoresearch-loop.sh --skip-bundle  # skip slow build step
#
# Logs saved to:  reports/autoresearch-loop-YYYY-MM-DD.log
# Summary:        reports/autoresearch-summary.txt (overwritten each run)
#
# Tips:
#   - Start overnight with: nohup bash scripts/autoresearch-loop.sh --loop 1800 &
#   - Stop with:            kill %1  (or kill the PID printed at start)
#   - Watch live:           tail -f reports/autoresearch-loop-$(date +%F).log

set -euo pipefail

# ── Parse flags ───────────────────────────────────────────────────────────────

LOOP_SECONDS=0      # 0 = run once
SKIP_BUNDLE=false
SKIP_LIGHTHOUSE=false

while [[ $# -gt 0 ]]; do
	case "$1" in
		--loop)        LOOP_SECONDS="${2:-600}"; shift 2 ;;
		--skip-bundle) SKIP_BUNDLE=true; shift ;;
		--skip-lighthouse) SKIP_LIGHTHOUSE=true; shift ;;
		*) echo "Unknown flag: $1"; exit 1 ;;
	esac
done

# ── Setup ─────────────────────────────────────────────────────────────────────

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="$ROOT/reports"
mkdir -p "$REPORTS_DIR"

LOG_FILE="$REPORTS_DIR/autoresearch-loop-$(date +%F).log"
SUMMARY_FILE="$REPORTS_DIR/autoresearch-summary.txt"

echo "════════════════════════════════════════════════════════════"
echo " Autoresearch Loop"
echo " Started: $(date)"
echo " PID: $$"
if [[ $LOOP_SECONDS -gt 0 ]]; then
	echo " Interval: every ${LOOP_SECONDS}s"
else
	echo " Mode: single run"
fi
echo " Log: $LOG_FILE"
echo "════════════════════════════════════════════════════════════"

# ── Run one iteration ─────────────────────────────────────────────────────────

run_checks() {
	local run_start
	run_start=$(date +%s)
	local timestamp
	timestamp=$(date '+%Y-%m-%d %H:%M:%S')

	echo ""
	echo "╔═══════════════════════════════════════════════════════════"
	echo "║ RUN: $timestamp"
	echo "╚═══════════════════════════════════════════════════════════"

	declare -A results
	results[i18n]="SKIP"
	results[schema]="SKIP"
	results[lighthouse]="SKIP"
	results[bundle]="SKIP"

	# ── 1. i18n drift ──────────────────────────────────────────────────────
	echo ""
	echo "▶ [1/4] i18n Drift Check"
	if node "$ROOT/scripts/i18n-drift.mjs" 2>&1; then
		results[i18n]="PASS"
	else
		results[i18n]="FAIL"
	fi

	# ── 2. Schema validation ────────────────────────────────────────────────
	echo ""
	echo "▶ [2/4] Schema.org Validation"
	if node "$ROOT/scripts/schema-check.mjs" 2>&1; then
		results[schema]="PASS"
	else
		results[schema]="FAIL"
	fi

	# ── 3. Lighthouse ───────────────────────────────────────────────────────
	echo ""
	echo "▶ [3/4] Lighthouse Audit"
	if [[ "$SKIP_LIGHTHOUSE" == "true" ]]; then
		echo "   (skipped via --skip-lighthouse)"
		results[lighthouse]="SKIP"
	elif node "$ROOT/scripts/lighthouse-check.mjs" 2>&1; then
		results[lighthouse]="PASS"
	else
		results[lighthouse]="FAIL"
	fi

	# ── 4. Bundle check ─────────────────────────────────────────────────────
	echo ""
	echo "▶ [4/4] Bundle Size Check"
	if [[ "$SKIP_BUNDLE" == "true" ]]; then
		echo "   (skipped via --skip-bundle)"
		results[bundle]="SKIP"
	elif node "$ROOT/scripts/bundle-check.mjs" 2>&1; then
		results[bundle]="PASS"
	else
		results[bundle]="FAIL"
	fi

	# ── Summary for this run ────────────────────────────────────────────────
	local run_end
	run_end=$(date +%s)
	local duration=$(( run_end - run_start ))

	local overall="PASS"
	for key in i18n schema lighthouse bundle; do
		if [[ "${results[$key]}" == "FAIL" ]]; then
			overall="FAIL"
			break
		fi
	done

	echo ""
	echo "┌───────────────────────────────────────────────────────────"
	echo "│ Summary — $timestamp  (${duration}s)"
	echo "├───────────────────────────────────────────────────────────"
	printf "│  %-18s %s\n" "i18n drift:"   "${results[i18n]}"
	printf "│  %-18s %s\n" "Schema.org:"   "${results[schema]}"
	printf "│  %-18s %s\n" "Lighthouse:"   "${results[lighthouse]}"
	printf "│  %-18s %s\n" "Bundle size:"  "${results[bundle]}"
	echo "│  ─────────────────────────────────"
	printf "│  %-18s %s\n" "Overall:"      "$overall"
	echo "└───────────────────────────────────────────────────────────"

	# Write terse summary file (easy to check in the morning)
	{
		echo "Last run: $timestamp (${duration}s)"
		echo "Overall:  $overall"
		echo ""
		echo "i18n:       ${results[i18n]}"
		echo "Schema:     ${results[schema]}"
		echo "Lighthouse: ${results[lighthouse]}"
		echo "Bundle:     ${results[bundle]}"
	} > "$SUMMARY_FILE"
}

# ── Loop or single run ────────────────────────────────────────────────────────

if [[ $LOOP_SECONDS -eq 0 ]]; then
	run_checks 2>&1 | tee -a "$LOG_FILE"
else
	echo "Running every ${LOOP_SECONDS}s. PID=$$. Stop with: kill $$"
	echo "Tail log: tail -f $LOG_FILE"
	while true; do
		run_checks 2>&1 | tee -a "$LOG_FILE"
		echo ""
		echo "  Sleeping ${LOOP_SECONDS}s … (next run: $(date -d "+${LOOP_SECONDS} seconds" '+%H:%M:%S' 2>/dev/null || date -v +${LOOP_SECONDS}S '+%H:%M:%S'))"
		sleep "$LOOP_SECONDS"
	done
fi
