import { connectToDatabase } from '@xcorphion/shared';
import { checkAdminAuth } from '../../../lib/adminAuth';

function sanitizeHtml(html) {
    if (typeof html !== 'string') return '';
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<(object|embed|link|meta|base)[^>]*\/?>/gi, '')
        .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/href\s*=\s*["']\s*javascript:[^"']*/gi, 'href="#"');
}

export default async function handler(req, res) {
    const db = await connectToDatabase('platform');
    const collection = db.collection('break_news_articles');
    
    // Pegando o id da rota dinâmica
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Invalid ID parameter' });
    }

    if (req.method === 'GET') {
        try {
            const article = await collection.findOne({ custom_id: id });
            
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
        if (!checkAdminAuth(req, res)) return;
        try {
            const body = req.body;
            if (!body || typeof body !== 'object') {
                return res.status(400).json({ success: false, error: 'Invalid payload' });
            }

            const updateFields = {};
            
            // Permite atualizar apenas campos previstos (OWASP API6:2023 - Evitar Mass Assignment)
            if (typeof body.card_title === 'string' && body.card_title.trim().length > 0) updateFields.card_title = body.card_title.trim();
            if (typeof body.card_legend === 'string') updateFields.card_legend = body.card_legend.trim();
            if (typeof body.card_image === 'string') updateFields.card_image = body.card_image.trim();
            if (typeof body.article_content === 'string') updateFields.article_content = sanitizeHtml(body.article_content);
            if (typeof body.author === 'string') updateFields.author = body.author.trim();
            if (Array.isArray(body.sources)) updateFields.sources = body.sources.filter(s => typeof s === 'string');

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
        if (!checkAdminAuth(req, res)) return;
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
