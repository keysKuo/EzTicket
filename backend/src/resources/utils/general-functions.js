module.exports.toUppercaseFirstLetter = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}
module.exports.eventStatusChangeCheck = (eventStatus, status) => {
    let validStatusList = ["ready", "pending", "running", "ended"]
    if (!validStatusList.includes(status)) {
        return { success: false, message: `Status "${status}" does not exist!` }
    }
    if (eventStatus == "pending") {
        if (status == "ready") {
            return { success: true }
        }
    }
    let eventStatusIndex = validStatusList.indexOf(eventStatus)
    let statusIndex = validStatusList.indexOf(status)
    if ((statusIndex - eventStatusIndex) == 1) {
        return { success: true }
    }
    return { success: false, message: `Status "${eventStatus}" can not be change to "${status}"` }
}
module.exports.ticketStatusChangeCheck = (status) => {
    let validStatusList = ["available", "pending", "soldout", "unavailable"]
    if (!validStatusList.includes(status)) {
        return { success: false, message: `Status ${status} is not valid!` }
    }
    return { success: true }
}