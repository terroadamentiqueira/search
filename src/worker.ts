import { KVNamespace } from '@cloudflare/workers-types';
import Fuse from 'fuse.js';

declare const search_kv: KVNamespace;

interface Document {
  id: string;
  title: string;
  content: string;
  metadata?: any;
}

async function fetchDocumentsFromKV(): Promise<Document[]> {
  const keys = await search_kv.list();
  const documents: Document[] = [];

  for (const key of keys.keys) {
    const document = await search_kv.get(key.name, 'json');
    if (document) {
      documents.push(document as Document);
    }
  }

  return documents;
}

async function enrichWithMetadata(document: Document): Promise<Document> {
  const metadata = await search_kv.get(`${document.id}:metadata`, 'json');
  return {
    ...document,
    metadata: metadata ?? {}
  };
}

async function searchDocuments(query: string): Promise<Document[]> {
  const documents = await fetchDocumentsFromKV();
  const enrichedDocuments = await Promise.all(
    documents.map(doc => enrichWithMetadata(doc))
  );

  const fuse = new Fuse(enrichedDocuments, {
    keys: ['title', 'content', 'metadata'],
    includeScore: true,
  });

  const result = fuse.search(query);
  return result.map(res => res.item);
}

async function createDocument(document: Document): Promise<void> {
  await search_kv.put(document.id, JSON.stringify(document));
  if (document.metadata) {
    await search_kv.put(`${document.id}:metadata`, JSON.stringify(document.metadata));
  }
}

addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  const query = url.searchParams.get('q');

  if (event.request.method === 'POST' && pathname === '/create') {
    event.respondWith(
      (async () => {
        const document: Document = await event.request.json();
        await createDocument(document);
        return new Response('Document created', { status: 201 });
      })()
    );
  } else if (event.request.method === 'GET' && pathname === '/search') {
    event.respondWith(
      (async () => {
        if (query) {
          const results = await searchDocuments(query);
          return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          return new Response('Query parameter is required', { status: 400 });
        }
      })()
    );
  } else {
    event.respondWith(new Response('Not found', { status: 404 }));
  }
});

