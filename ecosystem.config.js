module.exports = {
  apps: [
    {
      name: "my-react-app",
      script: "npm",
      args: "start", // Pastikan menggunakan 'start' dengan npm
      cwd: "", // Path yang benar ke direktori aplikasi React Anda
      interpreter: "none" // Menjalankan npm tanpa interpreter
    }
  ]
};
