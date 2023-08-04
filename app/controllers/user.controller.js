exports.adminBoard = (req, res) => {
    return res.status(200).send("Admin Content.");
};
exports.preparerBoard = (req, res) => {
    return res.status(200).send("Preparer Content.");
};
exports.reviewerBoard = (req, res) => {
    return res.status(200).send("Reviewer Content.");
};
