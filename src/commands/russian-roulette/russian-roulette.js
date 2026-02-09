module.exports = {
  contexts: [0, 1],
  integration_types: [0, 1, 2],
  dm_permission: true,
  name: 'russian-roulette',
  description: 'Play Russian Roulette with a friend! :D',
  options: [
    {
      name: 'user',
      description: 'The person to play with.',
      type: 6,
      required: true
    }
  ]
};
  
