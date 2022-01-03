const spawn = require("child_process").spawn;

const py = spawn("python", ["./script/weeblist.py"]);

let ratingData = {
  userID: "BG12",
  rating: {
    4: 7,
    1232: 10,
    1221: 8,
    6: 8,
  }
};

py.stdout.on("data", (data) => {
  console.log(data.toString());
});

py.stdin.write(JSON.stringify(ratingData));
py.stdin.end();
