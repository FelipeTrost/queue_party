function alphaNumeric(string) {
  console.log("alpha", string);
  return !!string.match(/^[a-z0-9]+$/i);
}
module.exports = function validRoomName(name) {
  if (!alphaNumeric(name))
    return { ok: false, message: "Name must be alphaNumeric" };

  if (name.length < 3 || name.length > 10)
    return { ok: false, message: "Name between 3 and 10 characters long" };

  return { ok: true };
};
