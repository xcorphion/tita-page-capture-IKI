import { connectToDatabase } from '../../../lib/mongodb';
import { checkAdminAuth } from '../../../lib/adminAuth';
import { sanitizeArticleHtml, asString } from '../../../lib/security';
import { rateLimit } from '../../../lib/rateLimit';

export default async function handler(req, res) {
    const db = await connectToDatabase('platform');
    const collection = db.collection('break_news_articles');

    const id = asString(req.query.id, 128);
    if (!id) {
        return res.status(400).json({ success: false, error: 'Invalid ID parameter' });
    }

    if (req.method === 'GET') {
        if (await rateLimit(req, { max: 60, windowMs: 60_000, bucket: 'article_get' }))
            return res.status(429).json({ success: false, error: 'Too many requests' });
        try {
            const article = await collection.findOne({ custom_id: id }, { maxTimeMS: 5000 });
            if (!article) {
                return res.status(404).json({ success: false, error: 'Article not found' });
            }
            return res.status(200).json({ success: true, data: article });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
    }

    if (req.method === 'PUT') {
        if (!(await checkAdminAuth(req, res))) return;
        try {
            const body = req.body;
            if (!body || typeof body !== 'object') {
                return res.status(400).json({ success: false, error: 'Invalid payload' });
            }

            const updateFields = {};
            const title = asString(body.card_title, 200);
            if (title) updateFields.card_title = title;

            const legend = asString(body.card_legend, 500);
            if (legend !== null) updateFields.card_legend = legend;

            const img = asString(body.card_image, 2000);
            if (img !== null) updateFields.card_image = img;

            if (typeof body.article_content === 'string') {
                updateFields.article_content = sanitizeArticleHtml(body.article_content);
            }

            const author = asString(body.author, 100);
            if (author) updateFields.author = author;

            if (Array.isArray(body.sources)) {
                updateFields.sources = body.sources
                    .filter(s => typeof s === 'string')
                    .slice(0, 30)
                    .map(s => s.slice(0, 500));
            }

            updateFields.updated_at = new Date();

            const result = await collection.updateOne(
                { custom_id: id },
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, error: 'Article not found' });
            }

            return res.status(200).json({ success: true, message: 'Article updated' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
    }

    if (req.method === 'DELETE') {
        if (!(await checkAdminAuth(req, res))) return;
        try {
            const result = await collection.deleteOne({ custom_id: id });
            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, error: 'Article not found' });
            }
            return res.status(200).json({ success: true, message: 'Article deleted' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, error: 'Database error' });
        }
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
