module.exports = {
  apps: [
    {
      name: "harfchi",
      script: "server/index.js",
      cwd: __dirname,
      node_args: "--env-file=.env",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "400M",
      time: true,
      env: { NODE_ENV: "production" },
    },
  ],
};
