import fs from 'fs';
import env from 'virtual:cds-env';

fs.writeFileSync('/home/.cdsrc.json', JSON.stringify(env));
