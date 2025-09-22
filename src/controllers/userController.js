exports.getUsers = (req, res) => {
  res.json([
    { id: 1, name: "Alex" },
    { id: 2, name: "Bena" }
  ]);
};
