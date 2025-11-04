module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // ¡Asegúrate de que esta línea esté!
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
  ]
};