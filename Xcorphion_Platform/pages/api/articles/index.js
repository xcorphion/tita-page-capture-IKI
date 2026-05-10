import { connectToDatabase } from '../../../lib/mongodb';
import { checkAdminAuth } from '../../../lib/adminAuth';
import { sanitizeArticleHtml, asString } from '../../../lib/security';
import { rateLimit } from '../../../lib/rateLimit';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
    const db = await connectToDatabase('platform');
    const collection = db.collection('break_news_articles');

    if (req.method === 'GET') {
        if (await rateLimit(req, { max: 60, windowMs: 60_000, bucket: 'articles_list' }))
            return res.status(429).json({ success: false, error: 'Too many requests' });
        try {
            const articles = await collection.find({})
                .project({ article_content: 0 })
                .sort({ published_at: -1 })
                .limit(100)
                .maxTimeMS(5000)
                .toArray();
            return res.status(200).json({ success: true, data: articles });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
    }

    if (req.method === 'POST') {
        if (!(await checkAdminAuth(req, res))) return;
        try {
            const body = req.body;
            if (!body || typeof body !== 'object') {
                return res.status(400).json({ success: false, error: 'Invalid payload' });
            }

            const card_title = asString(body.card_title, 200);
            if (!card_title)
                return res.status(400).json({ success: false, error: 'Title is required and must be a string' });

            const customId = asString(body.customId, 64);
            const sourceArr = Array.isArray(body.sources)
                ? body.sources.filter(s => typeof s === 'string').slice(0, 30).map(s => s.slice(0, 500))
                : [];

            const newArticle = {
                custom_id: customId || randomUUID(),
                card_title,
                card_legend: asString(body.card_legend, 500) || '',
                card_image: asString(body.card_image, 2000) || '',
                article_content: sanitizeArticleHtml(typeof body.article_content === 'string' ? body.article_content : ''),
                author: asString(body.author, 100) || 'Admin',
                sources: sourceArr,
                published_at: new Date(),
            };

            await collection.insertOne(newArticle);
            return res.status(201).json({ success: true, data: newArticle });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
