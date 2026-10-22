// One-off: download author portraits from Wikipedia with their licenses.
// Non-free images (fair use) are skipped; the card then shows a monogram.
import { mkdir, writeFile } from 'node:fs/promises';

const AUTHORS = { mishima: 'Yukio_Mishima', bulgakov: 'Mikhail_Bulgakov', dostoevsky: 'Fyodor_Dostoevsky', chekhov: 'Anton_Chekhov', hemingway: 'Ernest_Hemingway' };
const UA = { 'User-Agent': 'hiro-personal-site/1.0 (hiro@trykaiwa.com)' };
const credits = {};
await mkdir('static/portraits', { recursive: true });

for (const [id, title] of Object.entries(AUTHORS)) {
	const summary = await (await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, { headers: UA })).json();
	const file = decodeURIComponent(new URL(summary.originalimage.source).pathname.split('/').pop());
	const info = await (await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&iiurlwidth=240&titles=File:${encodeURIComponent(file)}`, { headers: UA })).json();
	const page = Object.values(info.query.pages)[0];
	const ii = page.imageinfo[0];
	const license = ii.extmetadata.LicenseShortName?.value ?? 'unknown';
	const free = !/fair use|non-free/i.test(license) && ii.extmetadata.NonFree?.value !== 'true';
	credits[id] = { file, license, free, artist: ii.extmetadata.Artist?.value?.replace(/<[^>]+>/g, '') ?? '', source: ii.descriptionurl };
	if (free) {
		const img = await fetch(ii.thumburl, { headers: UA });
		await writeFile(`static/portraits/${id}.jpg`, Buffer.from(await img.arrayBuffer()));
	}
	console.log(id, license, free ? 'saved' : 'SKIPPED (non-free)');
}
await writeFile('static/portraits/credits.json', JSON.stringify(credits, null, 2) + '\n');
