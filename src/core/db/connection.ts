import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const connectToDb = function () {
  const databaseUrl =
    process.env.DATABASE_URL || "mongodb://localhost:27017/life";

  mongoose
    .connect(databaseUrl)
    .then(() => {
      console.log("DB Connected ...");

      mongoose.connection.db
        .listCollections({ name: "governorates" })
        .next((error, collectionInfo) => {
          if (error) {
            console.error("Unable to inspect governorates collection:", error);
            return;
          }

          if (!collectionInfo) {
            const governoratesData = fs.readFileSync(
              path.join(
                __dirname,
                "..",
                "..",
                "..",
                "src",
                "core",
                "db",
                "governorates.json"
              )
            );
            const governorates = JSON.parse(governoratesData.toString());
            mongoose.connection.db
              .collection("governorates")
              .insertMany(governorates);
          }
        });

      mongoose.connection.db
        .listCollections({ name: "cities" })
        .next((error, collectionInfo) => {
          if (error) {
            console.error("Unable to inspect cities collection:", error);
            return;
          }

          if (!collectionInfo) {
            const citiesData = fs.readFileSync(
              path.join(
                __dirname,
                "..",
                "..",
                "..",
                "src",
                "core",
                "db",
                "cities.json"
              )
            );
            const cities = JSON.parse(citiesData.toString());
            mongoose.connection.db.collection("cities").insertMany(cities);
          }
        });
    })
    .catch((error) => {
      console.error("DB Connection Problem:", error.message);
      process.exit(1);
    });
};

export default connectToDb;
