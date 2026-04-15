import { serve } from '../lib/bookshop/serve';
import { set } from '../lib/utils';

set('served', 'Starting...')
await serve()
console.debug('app started');
set('served', 'Application started')

const url = '/browse/Books'
set('odata', `OData Response for ${url}:\n\nloading...`)
const response = await app.handle({ url })
console.debug('response', response);

set('odata', `OData Response for ${url}:\n\n${JSON.stringify(JSON.parse(response.body), null, 2)}`)
