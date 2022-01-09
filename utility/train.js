function retrainModel() {
  const spawn = require("child_process").spawn;

  const py = spawn("python", ["./script/retrain.py"]);

  py.stdout.on("data", (data) => {
    console.log(data.toString());
  });
}

module.exports = retrainModel