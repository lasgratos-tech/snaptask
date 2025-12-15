const metrics = {
    commandsAccepted: 0,
    commandsRejected: 0,
    commandsDuplicate: 0,
    revenueCents: 0
};
export function recordAccepted(amount) {
    metrics.commandsAccepted += 1;
    metrics.revenueCents += amount;
}
export function recordRejected() {
    metrics.commandsRejected += 1;
}
export function recordDuplicate() {
    metrics.commandsDuplicate += 1;
}
export function exportPrometheusMetrics() {
    return `
# HELP snaptask_commands_accepted Total accepted commands
# TYPE snaptask_commands_accepted counter
snaptask_commands_accepted ${metrics.commandsAccepted}

# HELP snaptask_commands_rejected Total rejected commands
# TYPE snaptask_commands_rejected counter
snaptask_commands_rejected ${metrics.commandsRejected}

# HELP snaptask_commands_duplicate Total duplicate commands
# TYPE snaptask_commands_duplicate counter
snaptask_commands_duplicate ${metrics.commandsDuplicate}

# HELP snaptask_revenue_cents Total revenue in cents
# TYPE snaptask_revenue_cents counter
snaptask_revenue_cents ${metrics.revenueCents}
`.trim();
}
//# sourceMappingURL=metrics.js.map