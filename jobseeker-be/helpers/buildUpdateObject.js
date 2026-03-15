/**************************
 * Return an object in format:
 *  updateData: {
 *    profile.name:"John Doe",
 *    profile.age: 20,
 *    profile.interest: ["Swimming", "Basketball"]
 * }
 *
 * this will ensure the code to not delete unmentioned field when using findByIdAndUpdate()
 *
 ****************************/

const buildUpdateObject = (updateDetail, allowedField) => {
  const updateData = {};

  for (const key in updateDetail) {
    if (allowedField && !allowedField.includes(key))
      return { error: `Update field ${key} is not allowed!` };
    const value = updateDetail[key];
    if (Array.isArray(value)) {
      updateData[key] = value;
    } else if (typeof value === "object" && value !== null) {
      for (const nestedKey in value) {
        // if (notAllowedField[key].includes(nestedKey))
        updateData[`${key}.${nestedKey}`] = value[nestedKey];
      }
    } else {
      updateData[key] = value;
    }
  }

  return updateData;
};

module.exports = {buildUpdateObject};