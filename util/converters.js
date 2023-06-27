// converts json to csv and save on db

const { parse } = require("json2csv");

// util function
exports.convertFromJSON_to_CSV = async (json) => {
  try {
    const csv = parse(json);
    // console.log(csv);
    return csv;
  } catch (err) {
    console.error(err);

    return err;
  }
};