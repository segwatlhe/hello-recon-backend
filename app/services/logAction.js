const db = require("../models");
const CaptureLogs = db.captureLogs;
function logAction(account_id=null, user_id, capture_id=null, action, description=null, workpaper_id=null, balance=null, month=null, year=null, company=null, currency=null, foreignBalance=null) {
    if (user_id === '') {
        return 'User ID required for logging';
    }

    const log_details = {
        account_id: account_id,
        user_id: user_id,
        capture_id: capture_id,
        action: action,
        description:description,
        workpaper_id: workpaper_id,
        balance: balance,
        month: month,
        year: year,
        company: company,
        currency: currency,
        foreignBalance: foreignBalance
    };
    CaptureLogs.create(log_details)
        .then(log_details => {
        })
        .catch(err => {
            return err.message;
        });
}
module.exports = {logAction};
