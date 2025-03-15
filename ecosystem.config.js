module.exports = {
    apps: [
      {
        name: "kug_frontend_v2",
        script: "npm",
        args: "start",
        cwd: "/home/ubuntu/apps/kug_frontend_v2/",
        env: {
          NODE_ENV: "production",
          PORT: 3000
        },
        instances: "max",
        exec_mode: "cluster",
        autorestart: true,
        watch: false,
        max_memory_restart: "1G"
      }
    ]
  };