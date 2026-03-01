export const csvs = {
'sap.capire.bookshop-Authors.csv': `
ID,name,dateOfBirth,placeOfBirth,dateOfDeath,placeOfDeath
101,Emily Brontë,1818-07-30,"Thornton, Yorkshire",1848-12-19,"Haworth, Yorkshire"
107,Charlotte Brontë,1818-04-21,"Thornton, Yorkshire",1855-03-31,"Haworth, Yorkshire"
150,Edgar Allan Poe,1809-01-19,"Boston, Massachusetts",1849-10-07,"Baltimore, Maryland"
170,Richard Carpenter,1929-08-14,"King’s Lynn, Norfolk",2012-02-26,"Hertfordshire, England"
`,
'sap.capire.bookshop-Books.csv': `
ID,title,descr,author_ID,stock,price,currency_code,genre_ID
201,Wuthering Heights,"Wuthering Heights, Emily Brontë's only novel, was published in 1847 under the pseudonym ""Ellis Bell"". It was written between October 1845 and June 1846. Wuthering Heights and Anne Brontë's Agnes Grey were accepted by publisher Thomas Newby before the success of their sister Charlotte's novel Jane Eyre. After Emily's death, Charlotte edited the manuscript of Wuthering Heights and arranged for the edited version to be published as a posthumous second edition in 1850.",101,12,11.11,GBP,11aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
207,Jane Eyre,"Jane Eyre /ɛər/ (originally published as Jane Eyre: An Autobiography) is a novel by English writer Charlotte Brontë, published under the pen name ""Currer Bell"", on 16 October 1847, by Smith, Elder & Co. of London. The first American edition was published the following year by Harper & Brothers of New York. Primarily a bildungsroman, Jane Eyre follows the experiences of its eponymous heroine, including her growth to adulthood and her love for Mr. Rochester, the brooding master of Thornfield Hall. The novel revolutionised prose fiction in that the focus on Jane's moral and spiritual development is told through an intimate, first-person narrative, where actions and events are coloured by a psychological intensity. The book contains elements of social criticism, with a strong sense of Christian morality at its core and is considered by many to be ahead of its time because of Jane's individualistic character and how the novel approaches the topics of class, sexuality, religion and feminism.",107,11,12.34,GBP,11aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
251,The Raven,"""The Raven"" is a narrative poem by American writer Edgar Allan Poe. First published in January 1845, the poem is often noted for its musicality, stylized language, and supernatural atmosphere. It tells of a talking raven's mysterious visit to a distraught lover, tracing the man's slow fall into madness. The lover, often identified as being a student, is lamenting the loss of his love, Lenore. Sitting on a bust of Pallas, the raven seems to further distress the protagonist with its constant repetition of the word ""Nevermore"". The poem makes use of folk, mythological, religious, and classical references.",150,333,13.13,USD,16aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
252,Eleonora,"""Eleonora"" is a short story by Edgar Allan Poe, first published in 1842 in Philadelphia in the literary annual The Gift. It is often regarded as somewhat autobiographical and has a relatively ""happy"" ending.",150,555,14,USD,15aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
271,Catweazle,"Catweazle is a British fantasy television series, starring Geoffrey Bayldon in the title role, and created by Richard Carpenter for London Weekend Television. The first series, produced and directed by Quentin Lawrence, was screened in the UK on ITV in 1970. The second series, directed by David Reid and David Lane, was shown in 1971. Each series had thirteen episodes, most but not all written by Carpenter, who also published two books based on the scripts.",170,22,150,JPY,13aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
`,
'sap.capire.bookshop-Books.texts.csv': `
ID_texts,ID,locale,title,descr
d2a65a27-9f2a-480f-bc38-84ee8ec5c13e,201,de,Sturmhöhe,"Sturmhöhe (Originaltitel: Wuthering Heights) ist der einzige Roman der englischen Schriftstellerin Emily Brontë (1818–1848). Der 1847 unter dem Pseudonym Ellis Bell veröffentlichte Roman wurde vom viktorianischen Publikum weitgehend abgelehnt, heute gilt er als ein Klassiker der britischen Romanliteratur des 19. Jahrhunderts."
8c42c706-a979-41cf-9ffe-91e6cf1383a0,201,fr,Les Hauts de Hurlevent,"Les Hauts de Hurlevent (titre original : Wuthering Heights), parfois orthographié Les Hauts de Hurle-Vent, est l'unique roman d'Emily Brontë, publié pour la première fois en 1847 sous le pseudonyme d’Ellis Bell. Loin d'être un récit moralisateur, Emily Brontë achève néanmoins le roman dans une atmosphère sereine, suggérant le triomphe de la paix et du Bien sur la vengeance et le Mal."
9e1c4c81-dc90-4600-85b1-e9dd4bf12ce0,207,de,Jane Eyre,"Jane Eyre. Eine Autobiographie (Originaltitel: Jane Eyre. An Autobiography), erstmals erschienen im Jahr 1847 unter dem Pseudonym Currer Bell, ist der erste veröffentlichte Roman der britischen Autorin Charlotte Brontë und ein Klassiker der viktorianischen Romanliteratur des 19. Jahrhunderts. Der Roman erzählt in Form einer Ich-Erzählung die Lebensgeschichte von Jane Eyre (ausgesprochen /ˌdʒeɪn ˈɛə/), die nach einer schweren Kindheit eine Stelle als Gouvernante annimmt und sich in ihren Arbeitgeber verliebt, jedoch immer wieder um ihre Freiheit und Selbstbestimmung kämpfen muss. Als klein, dünn, blass, stets schlicht dunkel gekleidet und mit strengem Mittelscheitel beschrieben, gilt die Heldin des Romans Jane Eyre nicht zuletzt aufgrund der Kino- und Fernsehversionen der melodramatischen Romanvorlage als die bekannteste englische Gouvernante der Literaturgeschichte"
9be0524b-4cb9-4fc1-9dc2-d65b1c13cf53,252,de,Eleonora,"“Eleonora” ist eine Erzählung von Edgar Allan Poe. Sie wurde 1841 erstveröffentlicht. In ihr geht es um das Paradox der Treue in der Treulosigkeit."
`,
'sap.capire.bookshop-Genres.csv': `
ID,parent_ID,name
10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,,Fiction
11aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Drama
12aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Poetry
13aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Fantasy
131aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,13aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Fairy Tale
132aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,13aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Epic Fantasy
133aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,13aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,High Fantasy
134aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,13aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Gothic
14aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Science Fiction
141aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,14aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Utopian and Dystopian
1411aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,141aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Utopian
1412aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,141aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Dystopian
14121aaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,1412aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Cyberpunk
141211aa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,14121aaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Steampunk
142aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,14aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Space Opera
143aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,14aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Time Travel
144aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,14aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Tech Noir
15aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Romance
151aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,15aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Contemporary Romance
152aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,15aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Historical Romance
153aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,15aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Romantic Suspense
16aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Mystery
161aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,16aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Crime
1611aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,161aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Thriller
16111aaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,1611aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Police Procedural
16112aaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,1611aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Legal Thriller
16113aaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,1611aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Medical Thriller
16114aaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,1611aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Spy Thriller
1612aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,161aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Detective
1613aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,161aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Suspense
162aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,16aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Noir
1621aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,162aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Nordic Noir
1622aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,162aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Tart Noir
163aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,16aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Cozy Mystery
17aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Adventure
18aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Short Story
19aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,10aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Graphic Novel
20aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,,Non-Fiction
21aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,20aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Biography
22aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,21aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Autobiography
23aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,20aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Essay
24aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,20aaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,Speech
`,
}