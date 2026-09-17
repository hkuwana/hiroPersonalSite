import { beforeEach, expect, test, vi } from 'vitest';

const env = vi.hoisted(() => ({
	RESEND_API_KEY: 'test-key',
	RESEND_FROM: 'Site <site@example.com>'
}));
vi.mock('$env/dynamic/private', () => ({ env }));
import { POST } from './+server';

let sequence = 0;
const fields = {
	name: 'Visitor',
	email: 'visitor@example.com',
	message: 'Hello Hiro',
	website: ''
};
const delivery = vi.fn();
function submit(
	body: unknown = fields,
	options: { origin?: string; ip?: string; raw?: string } = {}
) {
	return POST({
		request: new Request('https://hirokuwana.com/api/contact', {
			method: 'POST',
			headers: {
				origin: options.origin ?? 'https://hirokuwana.com',
				'content-type': 'application/json'
			},
			body: options.raw ?? JSON.stringify(body)
		}),
		url: new URL('https://hirokuwana.com/api/contact'),
		fetch: delivery,
		getClientAddress: () => options.ip ?? `visitor-${++sequence}`
	} as unknown as Parameters<typeof POST>[0]);
}
beforeEach(() => {
	env.RESEND_API_KEY = 'test-key';
	env.RESEND_FROM = 'Site <site@example.com>';
	delivery.mockReset().mockImplementation(async () => Response.json({ id: 'mail-1' }));
});

test('sends the message to Hiro with visitor reply-to and a stable retry key', async () => {
	expect((await submit()).status).toBe(200);
	const [url, request] = delivery.mock.calls[0];
	expect(url).toBe('https://api.resend.com/emails');
	expect(JSON.parse(request.body)).toEqual({
		from: env.RESEND_FROM,
		to: ['hiro@trykaiwa.com'],
		reply_to: fields.email,
		subject: 'Website message from Visitor',
		text: 'Name: Visitor\nEmail: visitor@example.com\n\nHello Hiro'
	});
	await submit();
	expect(delivery.mock.calls[1][1].headers['Idempotency-Key']).toBe(
		request.headers['Idempotency-Key']
	);
	await submit({ ...fields, message: 'A different note' });
	expect(delivery.mock.calls[2][1].headers['Idempotency-Key']).not.toBe(
		request.headers['Idempotency-Key']
	);
});

test.each([
	null,
	[],
	42,
	{ ...fields, name: {} },
	{ ...fields, name: 'A\nB' },
	{ ...fields, email: 'bad' },
	{ ...fields, message: ' ' },
	{ ...fields, message: 'x'.repeat(10001) },
	{ ...fields, website: 'spam' }
])('rejects invalid fields without sending: %j', async (body) => {
	expect((await submit(body)).status).toBe(400);
	expect(delivery).not.toHaveBeenCalled();
});

test('rejects malformed and oversized bodies', async () => {
	expect((await submit(null, { raw: '{' })).status).toBe(400);
	expect((await submit(null, { raw: 'x'.repeat(48001) })).status).toBe(413);
	expect(delivery).not.toHaveBeenCalled();
});

test('rejects cross-origin requests', async () => {
	expect((await submit(fields, { origin: 'https://another.example' })).status).toBe(403);
	expect(delivery).not.toHaveBeenCalled();
});

test('fails honestly when credentials are missing or Resend fails', async () => {
	env.RESEND_API_KEY = '';
	expect((await submit()).status).toBe(503);
	expect(delivery).not.toHaveBeenCalled();
	env.RESEND_API_KEY = 'test-key';
	delivery.mockResolvedValueOnce(Response.json({ error: 'provider detail' }, { status: 429 }));
	const response = await submit();
	expect(response.status).toBe(502);
	expect(await response.json()).toEqual({ ok: false, error: 'delivery-failed' });
	delivery.mockRejectedValueOnce(new DOMException('Timed out', 'TimeoutError'));
	expect((await submit()).status).toBe(502);
	delivery.mockResolvedValueOnce(Response.json({}));
	expect((await submit()).status).toBe(502);
});

test('throttles repeated requests from the same address', async () => {
	for (let i = 0; i < 5; i++) expect((await submit(fields, { ip: 'repeat' })).status).toBe(200);
	const response = await submit(fields, { ip: 'repeat' });
	expect(response.status).toBe(429);
	expect(response.headers.get('Retry-After')).toBe('60');
	expect(delivery).toHaveBeenCalledTimes(5);
});
