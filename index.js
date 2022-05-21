const express = require("express");
const { exec } = require("child_process");
const logger = require("./logger");

const PORT = process.env.PORT || 3000;

const app = express();

const runApp = (appName, appIndex) => {
  console.log(`cd ../${appName} && sh run.sh ${appIndex}`);
  exec(`cd ../${appName} && sh run.sh ${appIndex}`, (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });
};

const stopApp = (appName, appIndex) => {
  console.log(`cd ../${appName} && sh stop.sh ${appIndex}`);

  exec(
    `cd ../${appName} && sh stop.sh ${appIndex}`,
    (error, stdout, stderr) => {
      if (!error && appIndex === 'olx-cron-z') {
        logger.debug(`Olx-crawler зупинено`);
      }
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    }
  );
};

app.use("/run", async (req, res) => {
  try {
    const apps = req.query.apps ? req.query.apps.split(",") : null;
    if (apps) {
      for (let app of apps) {
        const appIndex = app.split("-")[app.split("-").length - 1];
        runApp(app, appIndex);
      }
    }
    res.status(200).send("OK");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

app.use("/stop", async (req, res) => {
  try {
    const apps = req.query.apps ? req.query.apps.split(",") : null;
    if (apps) {
      for (let app of apps) {
        const appIndex = app.split("-")[app.split("-").length - 1];
        stopApp(app, appIndex);
      }
    }
    res.status(200).send("OK");
  } catch (e) {
    res.status(400).send(e.message);
  }
});

app.use("/", async (req, res) => {
  res.status(200).send("process-run-manager: it works :)");
});

app.listen(PORT, async () => {
  console.log(`Start process-run-manager (port=${PORT})`);
});

module.exports = app;
