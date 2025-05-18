module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          'module-resolver',
          {
            root: ['./'], // or './app' if you prefer
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
            alias: {
              '@screens': './app/screens',
              '@navigation': './app/navigation',
              // add more aliases as you wish
            },
          },
        ],
      ],
    };
  };
  