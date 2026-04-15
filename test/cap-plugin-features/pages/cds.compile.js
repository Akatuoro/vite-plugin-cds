process.env.DEBUG = 'all'
import cds from '@sap/cds';
import { set } from '../lib/utils'

const model = 'entity MyEntity {key ID: Integer; name: String}';
const csn = cds.compile(model);

set('compiled-model', `Compiled:\n\n${JSON.stringify(csn.definitions, null, 2)}`)
