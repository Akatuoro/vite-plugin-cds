process.env.DEBUG = 'all'

import { serve } from '../lib/bookshop/serve';
import { traceConsole } from '../lib/utils';

const log = document.getElementById('log')

const entries = []

function add(...args) {
    entries.push(args.join(' '))
    log.textContent = entries.join('\n')
}

const reset = traceConsole({
    debug: (msg, ...args) => msg.startsWith('[trace]') ? add(msg, ...args) : 0,
    log: add,
    info: add,
    warn: add,
    error: add,
})
await serve()
reset()
