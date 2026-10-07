// UI strings for the windmill and desk islands (EN/JA).
export type Locale = 'en' | 'ja';

export const COPY_MILL: Record<Locale, Record<string, string>> = {
	en: {
		label: '風車 · each sail is one part of me',
		hint: 'Click the windmill to spin it, or drag and flick a sail. The sail that stops at the top chooses the panel.',
		canvas: 'Windmill. Press Enter to spin, or use the arrow keys to choose a sail.'
	},
	ja: {
		label: '風車 · 羽根の一枚一枚が、私の一部',
		hint: '風車をクリックすると回ります。羽根をドラッグして弾いても回せます。上で止まった羽根がパネルを選びます。',
		canvas: '風車。Enter で回り、矢印キーで羽根を選べます。'
	}
};

export const COPY_DESK: Record<Locale, Record<string, string>> = {
	en: {
		title: 'The desk',
		titleEm: 'the things I work with.',
		intro: 'Pick up a tag and toss it, or click one to see what it is. Organize puts everything on its shelf.',
		organize: 'Organize ☰',
		scatter: 'Scatter ↻',
		drop: 'Drop again ↻',
		take: 'My take',
		wiki: 'Read on Wikipedia ↗',
		list: 'Everything on the desk',
		canvas: 'Paper tags on a wooden desk. Use the list of items to open each one.'
	},
	ja: {
		title: '机',
		titleEm: '仕事の道具たち。',
		intro: 'タグをつまんで投げたり、クリックして中身を見たりできます。「整理する」で棚に並びます。',
		organize: '整理する ☰',
		scatter: '散らかす ↻',
		drop: 'もう一度落とす ↻',
		take: '私の見方',
		wiki: 'Wikipedia で読む ↗',
		list: '机の上のものすべて',
		canvas: '木の机の上の紙のタグ。下のリストからそれぞれを開けます。'
	}
};
