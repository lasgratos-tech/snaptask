export function canExecute(role, command) {
    switch (command.type) {
        case "CreateTask":
            return role !== "guest";
        case "ChangeStatus":
        case "ChangePriority":
        case "RenameTask":
            return role === "user" || role === "admin";
        default:
            return false;
    }
}
