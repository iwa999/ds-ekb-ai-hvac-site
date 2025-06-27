const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  // alias "@/..." → корень
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },

  // ⬇️ игнорируем TS-ошибки (как уже было)
  typescript: { ignoreBuildErrors: true },

  // ⬇️ ключевая строка: просим обычный Node-сервер, а не static export
  output: 'standalone'
};
