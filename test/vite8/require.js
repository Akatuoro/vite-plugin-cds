import fs from 'node:fs';

export default (id) => {
  if (id === 'node:fs') {
    return fs;
  }
  throw new Error(`Requiring ${JSON.stringify(id)} is not allowed.`);
};
