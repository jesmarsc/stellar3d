const CracoAlias = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'options',
        baseUrl: './',
        aliases: {
          '@components': './src/components',
          '@utils': './src/utils',
          '@stores': './src/stores',
        },
      },
    },
  ],
};
