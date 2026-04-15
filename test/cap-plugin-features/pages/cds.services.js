import { serve } from '../lib/bookshop/serve';
import { repl } from '../lib/utils';

await serve()

const { INSERT } = cds.ql;
const { CatalogService, AdminService } = cds.services;
let insert, Books, book

await repl(() => book = { ID: 1, title: 'Eldorado', author_ID: 13, genre_ID: '12aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
await repl(
    async () => await CatalogService.run(INSERT.into('CatalogService.Books').entries(book)) // expecting readonly error
)
await repl(() => Books = AdminService.entities.Books)
await repl(
    async () => await AdminService.run(INSERT.into(Books).entries(book)) // expecting assert error
)
await repl(async () => await cds.db.run(INSERT.into(Books).entries(book)));


await repl(() => insert = INSERT.into(Books).entries({ ID: 2, title: 'Eldorado', author_ID: 150, genre_ID: book.genre_ID }))
await repl(
    async () => await AdminService.run(insert)
)
