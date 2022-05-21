module.exports = {
    apps: [
      {
        name: 'process-run-manager',
        cwd: __dirname,
        script: "./index.js",
        env: {
          PORT: 3000,
        },
        max_memory_restart: "200M",
        node_args: [],
        exec_mode: "fork",
        out_file: "logs.log",
        error_file: "/dev/null",
      },
    ],
  };
  
