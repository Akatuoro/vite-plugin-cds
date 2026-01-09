import { requires } from '@sap/cds';
import basic from '@sap/cds/lib/srv/middlewares/auth/basic-auth.js';

export default function(o) {
    const options = { ...requires.auth, ...o }
    return basic(options)
}